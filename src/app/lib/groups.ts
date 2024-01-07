"use server";

import prisma from "../prisma";
import { createAndSetToken, getAndVerifyToken } from "./auth";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { randomBytes, scryptSync } from "crypto";

function generateHashedPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hashedPassword = scryptSync(password, salt, 64).toString("hex");
  const passwordWithSalt = `${hashedPassword}$${salt}`;

  return passwordWithSalt;
}

export async function createGroup(
  name: string,
  password: string,
  users: string[]
) {
  const hashedPassword = generateHashedPassword(password);

  const group = await prisma.groups.create({
    data: {
      name: name,
      password: hashedPassword,
      users: {
        createMany: {
          data: users.map((user: string) => ({ name: user })),
        },
      },
    },
  });

  await createAndSetToken(group.id);

  redirect(`/overview/${group.id}`);
}

export async function updateGroupName(groupId: string, name: string) {
  z.string().uuid().parse(groupId);
  z.string().parse(name);

  const token = await getAndVerifyToken();
  if (!token.isValidToken) {
    throw new Error("Unauthorized");
  } else if (!token.isValidForId(groupId)) {
    throw new Error("Forbidden");
  }

  return prisma.groups.update({
    where: {
      id: groupId,
    },
    data: {
      name: name,
    },
  });
}

export async function updateGroupPassword(groupId: string, password: string) {
  z.string().uuid().parse(groupId);
  z.string().parse(password);

  const token = await getAndVerifyToken();
  if (!token.isValidToken) {
    throw new Error("Unauthorized");
  } else if (!token.isValidForId(groupId)) {
    throw new Error("Forbidden");
  }

  return prisma.groups.update({
    where: {
      id: groupId,
    },
    data: {
      password: generateHashedPassword(password),
    },
  });
}

export async function updateGroupUsers(
  groupId: string,
  users: { id: string; name: string }[]
) {
  z.string().uuid().parse(groupId);
  z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ).parse(users);

  const token = await getAndVerifyToken();
  if (!token.isValidToken) {
    throw new Error("Unauthorized");
  } else if (!token.isValidForId(groupId)) {
    throw new Error("Forbidden");
  }

  return prisma.$transaction(
    users.map((u) =>
      !u.id
        ? prisma.users.create({
            data: {
              name: u.name,
              groupid: groupId,
            },
          })
        : prisma.users.update({
            where: {
              id: u.id,
            },
            data: {
              name: u.name,
            },
          })
    )
  );
}

export async function getGroupsForUser() {
  const token = await getAndVerifyToken();
  if (!token.isValidToken || !token.permissions.length) {
    return [];
  }

  const groups = await prisma.groups.findMany({
    where: {
      id: {
        in: token.permissions,
      },
    },
    select: {
      name: true,
      id: true,
    },
  });

  return groups;
}

export async function checkGroupExists(groupId: string) {
  z.string().uuid().parse(groupId);

  const count = await prisma.groups.count({
    where: {
      id: groupId,
    },
  });

  return !!count;
}

export async function deleteGroup(groupId: string) {
  z.string().uuid().parse(groupId);

  const token = await getAndVerifyToken();
  if (!token.isValidToken) {
    throw new Error("Unauthorized");
  } else if (!token.isValidForId(groupId)) {
    throw new Error("Forbidden");
  }

  return prisma.groups.delete({
    where: {
      id: groupId,
    },
  });
}

export async function getGroup(groupId: string) {
  z.string().uuid().parse(groupId);

  const token = await getAndVerifyToken();
  if (!token.isValidToken) {
    throw new Error("Unauthorized");
  } else if (!token.isValidForId(groupId)) {
    throw new Error("Forbidden");
  }

  const group = await prisma.groups.findUnique({
    where: {
      id: groupId,
    },
    select: {
      id: true,
      name: true,
      lastusedcurrency: true,
      users: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!group) {
    notFound();
  }

  return group;
}
