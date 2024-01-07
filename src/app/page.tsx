import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/react";

export default function Home() {
  return (
    <main className="w-full p-4 max-w-md">
      <Button className="w-full h-32" size="lg" as={Link} href="/create">
        Create Group
      </Button>
    </main>
  );
}
