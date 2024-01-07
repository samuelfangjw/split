import { Card, CardBody, Snippet } from "@nextui-org/react";
import { headers } from "next/headers";

export default async function GroupLink(params: { groupId: string }) {
  const headersList = headers();
  const hostname = headersList.get("host");
  const url = `${hostname}/overview/${params.groupId}`;

  return (
    <Card>
      <CardBody>
        This shareable link is used to access this group.
        <Snippet
          className="my-2"
          classNames={{ pre: "whitespace-pre-wrap" }}
          hideSymbol={true}
        >
          {url}
        </Snippet>
        Keep it somewhere safe, there is no other way to recover it once the
        link is lost.
      </CardBody>
    </Card>
  );
}
