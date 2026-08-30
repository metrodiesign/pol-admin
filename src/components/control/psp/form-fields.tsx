"use client";

import { useId } from "react";

import { TextField } from "@/components/form/text-field";
import { METHOD_LABEL, supportedMethods, type PspValidationErrors } from "@/lib/control/psp";
import { cn } from "@/lib/utils";
import type { PspMethod, PspProvider } from "@/types/control/psp-connection";

// Mirrors the checkout channel cards (src/components/policy/checkout-channel-card.tsx)
// without importing across modules; same public/payment assets and copy.
const METHOD_CARD: Record<PspMethod, { title: string; caption: string; image: string }> = {
  card: {
    title: "บัตรเครดิต / เดบิต",
    caption: "Visa, Mastercard, JCB, UnionPay",
    image: "/payment/credit-card-v2.png",
  },
  promptpay: {
    title: "PromptPay QR",
    caption: "สแกน QR จ่ายผ่านแอปธนาคาร",
    image: "/payment/promptpay-qr-v2.png",
  },
  installment: {
    title: "ผ่อนชำระ",
    caption: "KBank, KTC, BBL, BAY",
    image: "/payment/installment-v2.png",
  },
};

export function PspMethodFields({
  provider,
  value,
  onChange,
  error,
  disabled = false,
}: {
  provider: PspProvider | "";
  value: readonly PspMethod[];
  onChange: (value: PspMethod[]) => void;
  error?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const methods = provider ? supportedMethods(provider) : [];

  return (
    <fieldset
      className="sm:col-span-2"
      disabled={disabled}
      aria-describedby={error ? `${id}-error` : undefined}
      aria-invalid={Boolean(error) || undefined}
    >
      <legend className={cn("text-sm font-medium", error ? "text-error" : "text-grey-800")}>
        ช่องทางที่เปิดใช้ <span className="text-error">*</span>
      </legend>
      {provider ? (
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {methods.map((method) => {
            const card = METHOD_CARD[method];
            return (
              <label
                key={method}
                className="group flex cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--divider)] p-3.5 transition-colors hover:bg-grey-100 has-[:checked]:border-secondary has-[:checked]:bg-secondary/4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.image} alt={METHOD_LABEL[method]} className="h-20 w-20 shrink-0 object-contain" />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-sm font-bold text-foreground group-has-[:checked]:text-secondary">
                    {card.title}
                  </span>
                  <span className="text-xs leading-relaxed text-grey-500">{card.caption}</span>
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={value.includes(method)}
                  onChange={(event) =>
                    onChange(
                      event.target.checked
                        ? [...value, method]
                        : value.filter((candidate) => candidate !== method),
                    )
                  }
                />
              </label>
            );
          })}
        </div>
      ) : (
        <p className="mt-2 text-sm text-grey-600">เลือก PSP ก่อนเลือกช่องทาง</p>
      )}
      {error ? <p id={`${id}-error`} className="mt-1.5 text-xs text-error">{error}</p> : null}
    </fieldset>
  );
}

export function PspCredentialFields({
  provider,
  secretKey,
  pspMerchantId,
  onSecretKeyChange,
  onPspMerchantIdChange,
  errors,
  disabled = false,
}: {
  provider: PspProvider | "";
  secretKey: string;
  pspMerchantId: string;
  onSecretKeyChange: (value: string) => void;
  onPspMerchantIdChange: (value: string) => void;
  errors: PspValidationErrors;
  disabled?: boolean;
}) {
  if (!provider) {
    return <p className="text-sm text-grey-600 sm:col-span-2">เลือก PSP เพื่อกรอก Credential เริ่มต้น</p>;
  }

  return (
    <>
      {provider === "2c2p" ? (
        <TextField
          label="2C2P Merchant ID"
          type="password"
          value={pspMerchantId}
          onChange={onPspMerchantIdChange}
          error={errors.pspMerchantId}
          autoComplete="new-password"
          spellCheck={false}
          disabled={disabled}
          required
        />
      ) : null}
      <TextField
        label="secretKey"
        type="password"
        value={secretKey}
        onChange={onSecretKeyChange}
        error={errors.secretKey}
        autoComplete="new-password"
        spellCheck={false}
        disabled={disabled}
        required
        className={provider === "omise" ? "sm:col-span-2" : undefined}
      />
    </>
  );
}
