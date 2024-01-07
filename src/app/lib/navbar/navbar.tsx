"use client";

import {
  Navbar as Nav,
  NavbarContent,
  Link,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@nextui-org/react";
import { useState } from "react";
import { useParams, usePathname } from "next/navigation";
import ActiveGroupsDropdown from "./active-groups-dropdown";
import { groups } from "@prisma/client";

const getPageName = (groupId: string, pathName: string) => {
  const routes = [
    ["/", "split"],
    ["/create", "Create Group"],
    [`/auth/${groupId}`, "Authentication"],
    [`/overview/${groupId}`, "Overview"],
    [`/debts/${groupId}`, "Settle Debts"],
    [`/expenses/${groupId}`, "Expense"],
    [`/expenses/add/${groupId}`, "Add Expense"],
    [`/settings/${groupId}`, "Settings"],
  ];

  let pageName = "";

  for (let i = 0; i < routes.length; i++) {
    const [route, name] = routes[i];
    if (route === pathName) {
      pageName = name;
      break;
    }
  }

  return pageName;
};

export default function Navbar({
  groups,
}: {
  groups: Omit<groups, "password" | "lastusedcurrency">[];
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;
  const path = usePathname();
  const groupName =
    groups.find((g) => g.id === groupId)?.name || "select group";
  const isLoggedInUser = groupName !== "select group";

  const menuItems: {
    name: string;
    link: string;
    showToLoggedIn: boolean;
    showToLoggedOut: boolean;
  }[] = [
    {
      name: "Home",
      link: `/`,
      showToLoggedIn: false,
      showToLoggedOut: true,
    },
    {
      name: "Overview",
      link: `/overview/${groupId}`,
      showToLoggedIn: true,
      showToLoggedOut: false,
    },
    {
      name: "Add Expense",
      link: `/expenses/add/${groupId}`,
      showToLoggedIn: true,
      showToLoggedOut: false,
    },
    {
      name: "Settle Debts",
      link: `/debts/${groupId}`,
      showToLoggedIn: true,
      showToLoggedOut: false,
    },
    {
      name: "Create New Group",
      link: `/create`,
      showToLoggedIn: true,
      showToLoggedOut: true,
    },
    {
      name: "Settings",
      link: `/settings/${groupId}`,
      showToLoggedIn: true,
      showToLoggedOut: false,
    },
    {
      name: "Settings",
      link: `/settings`,
      showToLoggedIn: false,
      showToLoggedOut: true,
    },
  ];

  return (
    <Nav className="w-screen" onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        />

        <NavbarMenu>
          {menuItems
            .filter(({ showToLoggedIn, showToLoggedOut }) =>
              isLoggedInUser ? showToLoggedIn : showToLoggedOut
            )
            .map(({ name, link }, index) => (
              <NavbarMenuItem key={`${name}-${index}`}>
                <Link
                  color={"foreground"}
                  className="w-full"
                  href={link}
                  size="lg"
                >
                  {name}
                </Link>
              </NavbarMenuItem>
            ))}
        </NavbarMenu>

        <h1 className="whitespace-nowrap">{getPageName(groupId, path)}</h1>
      </NavbarContent>

      <NavbarContent className="min-w-0" justify="end">
        {!!groups.length && (
          <ActiveGroupsDropdown groupName={groupName} groups={groups} />
        )}
      </NavbarContent>
    </Nav>
  );
}
