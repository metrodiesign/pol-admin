import Image from "next/image";
import { Send, ArrowRight } from "lucide-react";
import { WidgetCard } from "../widget-card";
import { contacts } from "@/lib/mock/banking";

export function BankingContacts() {
  return (
    <WidgetCard
      title="Contacts"
      subtitle="You have 122 contacts"
      bodyClassName="p-0"
      action={
        <button
          type="button"
          className="-mr-3 inline-flex items-center gap-1 rounded-control px-3 py-1.5 text-sm font-semibold text-grey-800 transition-colors hover:bg-[var(--action-hover)]"
        >
          View all
          <ArrowRight className="size-4" />
        </button>
      }
    >
      <ul>
        {contacts.map((c, i) => (
          <li
            key={c.name}
            className={`flex items-center gap-3 px-6 py-3 transition-colors hover:bg-grey-50 ${
              i < contacts.length - 1 ? "border-b border-dashed border-grey-300" : ""
            }`}
          >
            <Image
              src={c.avatar}
              alt={c.name}
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-full object-cover bg-grey-200"
              unoptimized
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-grey-800">{c.name}</p>
              <p className="truncate text-xs text-grey-500">{c.email}</p>
            </div>
            <button
              type="button"
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-grey-500 transition-colors hover:bg-grey-200 hover:text-grey-800"
              aria-label={`Quick transfer to ${c.name}`}
            >
              <Send className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}
