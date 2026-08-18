"use client";

import { useState } from "react";
import {
  IdCard,
  Receipt,
  Bell,
  Share2,
  KeyRound,
  ChevronRight,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { AvatarUpload } from "@pol/ui/avatar-upload";
import { Switch } from "@/components/ui/switch";
import { FloatingInput } from "@/components/shared/floating-input";
import { TextField } from "@/components/form/text-field";
import { CountrySelect } from "@/components/form/country-select";
import { PhoneCountrySelect } from "@/components/form/phone-country-select";
import { COUNTRY_OPTIONS } from "@/lib/countries";

const TABS = [
  { key: "general", label: "General", icon: IdCard },
  { key: "billing", label: "Billing", icon: Receipt },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "social", label: "Social links", icon: Share2 },
  { key: "security", label: "Security", icon: KeyRound },
] as const;

const AVATAR_URL =
  "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-25.webp";

function GeneralTab() {
  const [publicProfile, setPublicProfile] = useState(true);
  const [phone, setPhone] = useState("(416) 555-0198");
  const [country, setCountry] = useState("Canada");
  const [phoneCountry, setPhoneCountry] = useState("ca");

  return (
    <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
      {/* Left card: avatar + controls */}
      <div className="mmd:col-span-4">
        <div
          className="rounded-card bg-card px-6 pb-10 pt-20"
          style={{
            boxShadow:
              "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
          }}
        >
          <AvatarUpload src={AVATAR_URL} alt="Jaydon Frankie" size={144} />

          <div className="mt-8 flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-grey-800">Public profile</span>
            <Switch
              checked={publicProfile}
              onCheckedChange={setPublicProfile}
              className="data-checked:bg-success"
            />
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="h-9 rounded-control bg-error/16 px-3 py-1.5 text-sm font-bold leading-6 text-error-dark transition-colors hover:bg-error/24"
            >
              Delete user
            </button>
          </div>
        </div>
      </div>

      {/* Right card: fields */}
      <div className="mmd:col-span-8">
        <div
          className="rounded-card bg-card p-6"
          style={{
            boxShadow:
              "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
          }}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FloatingInput label="Name" defaultValue="Jaydon Frankie" />
            <FloatingInput label="Email address" defaultValue="demo@minimals.cc" />
            <TextField
              label="Phone number"
              type="tel"
              value={phone}
              onChange={setPhone}
              startAdornment={
                <PhoneCountrySelect value={phoneCountry} onChange={setPhoneCountry} />
              }
              endAdornment={
                phone ? (
                  <button
                    type="button"
                    onClick={() => setPhone("")}
                    className="text-grey-400 transition-colors hover:text-grey-600"
                    aria-label="Clear phone number"
                  >
                    <X className="size-4" />
                  </button>
                ) : undefined
              }
            />
            <FloatingInput label="Address" defaultValue="90210 Broadway Blvd" />
            <CountrySelect
              value={country}
              onChange={setCountry}
              options={COUNTRY_OPTIONS}
            />
            <FloatingInput label="State/region" defaultValue="California" />
            <FloatingInput label="City" defaultValue="San Francisco" />
            <FloatingInput label="Zip/code" defaultValue="94116" />
            <div className="sm:col-span-2">
              <FloatingInput
                label="About"
                defaultValue="Praesent turpis. Phasellus viverra nulla ut metus varius laoreet. Phasellus tempus."
                multiline
                rows={4}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="h-9 rounded-control bg-grey-800 px-3 py-1.5 text-sm font-bold leading-6 text-white transition-colors hover:bg-grey-900 dark:bg-white dark:text-grey-900 dark:hover:bg-grey-300"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserAccountPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <>
      <PageHeader
        title="Account"
        breadcrumbs={[
          { label: "Dashboard", href: "/minimals" },
          { label: "User", href: "/minimals/user/list" },
          { label: "Account" },
        ]}
      />

      {/* Settings tabs */}
      <div className="relative mb-6 overflow-x-auto">
        <div className="flex gap-0 border-b border-grey-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm transition-colors",
                activeTab === tab.key
                  ? "border-grey-800 font-semibold text-grey-800"
                  : "border-transparent font-medium text-grey-500 hover:text-grey-700",
              )}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>
        {/* Mobile overflow affordance */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 flex items-center bg-gradient-to-l from-background to-transparent pl-6 pr-1 sm:hidden">
          <ChevronRight className="size-4 text-grey-400" />
        </div>
      </div>

      {activeTab === "general" && <GeneralTab />}
      {activeTab !== "general" && (
        <div className="dashboard-card flex min-h-[300px] items-center justify-center p-6">
          <p className="text-sm capitalize text-grey-400">
            {TABS.find((t) => t.key === activeTab)?.label} settings
          </p>
        </div>
      )}
    </>
  );
}
