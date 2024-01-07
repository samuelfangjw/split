import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { ThemeSwitcher } from "./[groupId]/theme-switcher";

export default async function Settings() {
  return (
    <main className="w-full p-4 max-w-md">
      <Card shadow="none" className="bg-transparent">
        <CardHeader>
          <h2 className="font-medium">Individual Settings</h2>
        </CardHeader>

        <CardBody>
          <ThemeSwitcher />
        </CardBody>
      </Card>
    </main>
  );
}
