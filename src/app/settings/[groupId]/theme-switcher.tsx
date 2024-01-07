"use client";

import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
} from "@nextui-org/react";
import { useTheme } from "next-themes";

export function ThemeSwitcher() {
  const { setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <h3>Theme</h3>
      </CardHeader>

      <CardBody className="flex flex-row justify-start">
        <ButtonGroup className="flex w-full">
          <Button
            className="grow"
            color="primary"
            onClick={() => setTheme("light")}
          >
            Light
          </Button>
          <Button
            className="grow"
            color="primary"
            onClick={() => setTheme("dark")}
          >
            Dark
          </Button>
        </ButtonGroup>
      </CardBody>
    </Card>
  );
}
