import { getGroupsForUser } from "../groups";
import Navbar from "./navbar";

export default async function NavbarWrapper() {
  const groups = await getGroupsForUser();

  return <Navbar groups={groups} />;
}
