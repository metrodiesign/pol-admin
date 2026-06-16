import { CustomBreadcrumbs } from "@/components/shared/custom-breadcrumbs";
import { ChatView } from "@/components/dashboard/chat/chat-view";

export const metadata = {
  title: "Chat | Dashboard - Minimal UI",
};

export default function ChatPage() {
  return (
    <div className="flex flex-col gap-3">
      <CustomBreadcrumbs heading="Chat" className="mb-0" />
      <ChatView />
    </div>
  );
}
