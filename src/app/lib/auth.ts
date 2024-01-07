"use server";

import { cookies } from "next/headers";
import { encrypt, decrypt } from "paseto-ts/v4";
import { z } from "zod";
import { redirect } from "next/navigation";
import prisma from "../prisma";
import { scryptSync } from "crypto";

const secret: string = process.env.PASERK_SECRET?.trim()!;

function getToken(): string {
  const cookieStore = cookies();
  const token: string = cookieStore.get("token")?.value || "";

  return token;
}

async function decryptToken(token: string): Promise<string[]> {
  if (!token) {
    return [];
  }

  try {
    const { payload } = await decrypt(secret, token);
    return payload.permissions;
  } catch (e) {
    return [];
  }
}

export async function createAndSetToken(id: string): Promise<string> {
  const token: string = getToken();
  let permissions: string[] = await decryptToken(token);
  permissions.push(id);

  const groups = await prisma.groups.findMany({
    where: {
      id: {
        in: permissions,
      },
    },
    select: {
      name: true,
      id: true,
    },
  });

  permissions = groups.map((g) => g.id);

  const newToken = await encrypt(secret, {
    permissions: permissions,
    exp: "14 days",
  });

  cookies().set("token", newToken, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 600000,
    path: "/",
  });

  return newToken;
}

export async function getAndVerifyToken(): Promise<{
  isValidToken: boolean;
  permissions: string[];
  isValidForId: (id: string) => boolean;
}> {
  const token: string = getToken();

  return verifyToken(token);
}

export async function verifyToken(token: string): Promise<{
  isValidToken: boolean;
  permissions: string[];
  isValidForId: (id: string) => boolean;
}> {
  const permissions: string[] = await decryptToken(token);

  return {
    isValidToken: permissions.length > 0,
    permissions: permissions,
    isValidForId: (id: string) => permissions.includes(id),
  };
}

export async function authenticateUserForGroup(
  groupId: string,
  password: string
): Promise<string> {
  z.string().uuid().parse(groupId);
  z.string().parse(password);

  const group = await prisma.groups.findUnique({
    where: {
      id: groupId,
    },
    select: {
      password: true,
    },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  const [storedHash, salt] = group.password.split("$");
  const givenHash = scryptSync(password, salt, 64).toString("hex");

  if (givenHash !== storedHash) {
    return "Invalid Password";
  }

  await createAndSetToken(groupId);

  redirect(`/overview/${groupId}`);
}
