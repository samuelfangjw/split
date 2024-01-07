import { ChevronDown } from "@/app/icons/ChevronDown";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
} from "@nextui-org/react";

export default function ActiveGroupsDropdown({
  groupName,
  groups,
}: {
  groupName: string;
  groups: { name: string; id: string }[];
}) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          disableRipple
          endContent={<ChevronDown className="shrink-0" fill="currentColor" />}
          radius="sm"
          variant="light"
        >
          <span className="truncate">{groupName}</span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Switch Groups"
        className="w-[340px]"
        itemClasses={{
          base: "gap-4",
        }}
      >
        {groups.map(({ name, id }: { name: string; id: string }) => (
          <DropdownItem key={id} as={Link} href={`/overview/${id}`}>
            {name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
