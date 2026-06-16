"use client";

import { useState } from "react";
import { Send, CreditCard, ArrowDownToLine, TrendingUp, TrendingDown } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { bankingOverview } from "@/lib/mock/banking";
import { cn } from "@/lib/utils";
import { ChartTooltip } from "@/components/charts/chart-tooltip";

type Tab = "income" | "expenses";

export function BankingOverview() {
  const [activeTab, setActiveTab] = useState<Tab>("income");
  const { totalBalance, income, expenses, incomeData, expensesData } = bankingOverview;

  const chartData = activeTab === "income" ? incomeData : expensesData;
  const chartColor = activeTab === "income" ? "#00A76F" : "#FF5630";
  const gradId = activeTab === "income" ? "banking-grad-income" : "banking-grad-expenses";

  return (
    <div className="dashboard-card p-6">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-grey-500">Total balance</p>
          <p
            className="mt-1 text-[2rem] font-bold leading-[3rem] text-grey-800"
            style={{ fontFamily: "var(--font-barlow, var(--font-sans))" }}
          >
            {totalBalance}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {[
            { icon: Send, label: "Send" },
            { icon: CreditCard, label: "Add card" },
            { icon: ArrowDownToLine, label: "Request" },
          ].map((action) => (
            <button
              key={action.label}
              type="button"
              className="flex items-center gap-1.5 rounded-control px-2 py-1 text-sm font-bold text-grey-800 transition-colors"
              style={{ backgroundColor: "rgba(145,158,171,0.16)" }}
            >
              <action.icon className="size-4" />
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Income / Expenses tabs */}
      <div className="mt-6 flex flex-wrap gap-3">
        {/* Income tab */}
        <button
          type="button"
          onClick={() => setActiveTab("income")}
          className={cn(
            "flex items-center gap-3 rounded-card px-4 py-3 text-left transition-all",
            activeTab === "income"
              ? "bg-grey-800 text-white"
              : "bg-grey-100 text-grey-700 hover:bg-grey-200",
          )}
        >
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full",
              activeTab === "income" ? "bg-white/16" : "bg-success/8",
            )}
          >
            <TrendingUp
              className={cn("size-5", activeTab === "income" ? "text-white" : "text-success")}
            />
          </span>
          <div>
            <p className={cn("text-xs", activeTab === "income" ? "text-white/64" : "text-grey-500")}>
              Income
            </p>
            <p className={cn("text-sm font-bold", activeTab === "income" ? "text-white" : "text-grey-800")}>
              {income.value}
            </p>
          </div>
          <span
            className={cn(
              "ml-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
              activeTab === "income"
                ? "bg-white/16 text-white"
                : "bg-success/16 text-success-dark",
            )}
          >
            {income.change}
          </span>
        </button>

        {/* Expenses tab */}
        <button
          type="button"
          onClick={() => setActiveTab("expenses")}
          className={cn(
            "flex items-center gap-3 rounded-card px-4 py-3 text-left transition-all",
            activeTab === "expenses"
              ? "bg-grey-800 text-white"
              : "bg-grey-100 text-grey-700 hover:bg-grey-200",
          )}
        >
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full",
              activeTab === "expenses" ? "bg-white/16" : "bg-error/8",
            )}
          >
            <TrendingDown
              className={cn("size-5", activeTab === "expenses" ? "text-white" : "text-error")}
            />
          </span>
          <div>
            <p className={cn("text-xs", activeTab === "expenses" ? "text-white/64" : "text-grey-500")}>
              Expenses
            </p>
            <p className={cn("text-sm font-bold", activeTab === "expenses" ? "text-white" : "text-grey-800")}>
              {expenses.value}
            </p>
          </div>
          <span
            className={cn(
              "ml-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
              activeTab === "expenses"
                ? "bg-white/16 text-white"
                : "bg-error/16 text-error-dark",
            )}
          >
            {expenses.change}
          </span>
        </button>
      </div>

      {/* Chart */}
      <div className="mt-6 h-[280px]">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height: 280 }}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.24} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(145,158,171,0.2)" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#919EAB" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#919EAB" }}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              key={activeTab}
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={2.5}
              fill={`url(#${gradId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
