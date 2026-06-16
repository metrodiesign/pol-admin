"use client";

import { useState } from "react";
import { EditPageHeader } from "@/components/shared/edit-page-header";
import { UserEditProfileCard } from "@/components/dashboard/user/user-edit-profile-card";
import { UserEditFormCard } from "@/components/dashboard/user/user-edit-form-card";

export default function UserEditPage() {
  const [banned, setBanned] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);

  return (
    <>
      <EditPageHeader
        title="Edit"
        backHref="/dashboard/user/list"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "User", href: "/dashboard/user/list" },
          { label: "Angelique Morse" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 mmd:grid-cols-12">
        <div className="mmd:col-span-4">
          <UserEditProfileCard
            avatarUrl="https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-17.webp"
            name="Angelique Morse"
            status="pending"
            banned={banned}
            emailVerified={emailVerified}
            onBannedChange={setBanned}
            onEmailVerifiedChange={setEmailVerified}
            onDeleteUser={() => {}}
          />
        </div>
        <div className="mmd:col-span-8">
          <UserEditFormCard
            initialData={{
              fullName: "Angelique Morse",
              email: "benny89@yahoo.com",
              phoneNumber: "08-12 34 56",
              country: "Sweden",
              stateRegion: "Virginia",
              city: "Rancho Cordova",
              address: "908 Jack Locks",
              zipCode: "85807",
              company: "Wuckert Inc",
              role: "Content Creator",
            }}
            submitLabel="Save changes"
          />
        </div>
      </div>
    </>
  );
}
