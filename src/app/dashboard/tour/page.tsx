import { redirect } from "next/navigation";

export default function TourIndexPage() {
  redirect("/dashboard/tour/list");
}
