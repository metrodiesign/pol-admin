import { redirect } from "next/navigation";

export default function SubpathsIndexPage() {
  redirect("/dashboard/subpaths/sub-1/sub-2");
}
