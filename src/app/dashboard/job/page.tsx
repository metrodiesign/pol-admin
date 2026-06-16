import { redirect } from "next/navigation";

export default function JobIndexPage() {
  redirect("/dashboard/job/list");
}
