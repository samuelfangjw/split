import { Card, CardBody, CardHeader, Spacer } from "@nextui-org/react";
import { ThemeSwitcher } from "./theme-switcher";
import { getGroup } from "@/app/lib/groups";
import BasicInformationSection from "./basic-information";
import UsersSection from "./users";
import DeleteGroupSection from "./delete-group";

export default async function Settings({
  params,
}: {
  params: { groupId: string };
}) {
  const group = await getGroup(params.groupId);

  return (
    <main className="w-full p-4 max-w-md">
      <Card shadow="none" className="bg-transparent">
        <CardHeader>
          <h2 className="font-medium">Individual Settings</h2>
        </CardHeader>

        <CardBody>
          <ThemeSwitcher />
        </CardBody>

        <CardHeader>
          <h2 className="text-lg font-medium">Group Settings</h2>
        </CardHeader>

        <CardBody>
          <BasicInformationSection group={group} />
          <Spacer y={4} />
          <UsersSection group={group} />
          <Spacer y={4} />
          <DeleteGroupSection group={group} />
        </CardBody>
      </Card>
    </main>
  );
}
