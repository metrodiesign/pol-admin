import { BankingOverview } from "@/components/dashboard/banking/banking-overview";
import { BankingBalanceStats } from "@/components/dashboard/banking/banking-balance-stats";
import { BankingExpenses } from "@/components/dashboard/banking/banking-expenses";
import { BankingRecentTransitions } from "@/components/dashboard/banking/banking-recent-transitions";
import { BankingCreditCard } from "@/components/dashboard/banking/banking-credit-card";
import { BankingQuickTransfer } from "@/components/dashboard/banking/banking-quick-transfer";
import { BankingContacts } from "@/components/dashboard/banking/banking-contacts";
import { BankingInvite } from "@/components/dashboard/banking/banking-invite";

export const metadata = {
  title: "Banking | Dashboard - Minimal UI",
};

export default function BankingPage() {
  return (
    <div className="grid grid-cols-1 gap-6 pb-16 pt-2 mmd:grid-cols-12">
      {/* Left column — 8/12 */}
      <div className="space-y-6 mmd:col-span-8">
        <BankingOverview />
        <BankingBalanceStats />
        <BankingExpenses />
        <BankingRecentTransitions />
      </div>

      {/* Right rail — 4/12 */}
      <div className="space-y-6 mmd:col-span-4">
        <BankingCreditCard />
        <BankingQuickTransfer />
        <BankingContacts />
        <BankingInvite />
      </div>
    </div>
  );
}
