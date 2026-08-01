"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { Fieldset, Field, Label, Description } from "@/components/shared/fieldset";
import { Switch } from "@/components/ui/switch";
import { UserEditFormCard } from "@/components/dashboard/user/user-edit-form-card";

export default function UserCreatePage() {
  const [emailVerified, setEmailVerified] = useState(true);

  return (
    <>
      <PageHeader
        title="Create a new user"
        breadcrumbs={[
          { label: "Dashboard", href: "/minimals" },
          { label: "User", href: "/minimals/user/list" },
          { label: "Create" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
        <div className="mmd:col-span-4">
          <div
            className="rounded-card bg-card px-6 pb-10 pt-20"
            style={{
              boxShadow:
                "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
            }}
          >
            <AvatarUpload size={144} />

            <Fieldset aria-label="Account settings" className="mt-10">
              <div className="space-y-5">
                <Field className="flex-row items-start justify-between gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Email verified</Label>
                    <Description>
                      Disabling this will automatically send the user a verification email
                    </Description>
                  </div>
                  <Switch
                    checked={emailVerified}
                    onCheckedChange={setEmailVerified}
                    className="data-checked:bg-success"
                  />
                </Field>
              </div>
            </Fieldset>
          </div>
        </div>

        <div className="mmd:col-span-8">
          <UserEditFormCard
            initialData={{
              fullName: "",
              email: "",
              phoneNumber: "",
              country: "",
              stateRegion: "",
              city: "",
              address: "",
              zipCode: "",
              company: "",
              role: "",
            }}
            submitLabel="Create user"
          />
        </div>
      </div>
    </>
  );
}
