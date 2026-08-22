"use client";

import { useId } from "react";

import { TextField } from "@/components/form/text-field";
import { METHOD_LABEL, supportedMethods, type PspValidationErrors } from "@/lib/control/psp";
import { cn } from "@/lib/utils";
import type { PspMethod, PspProvider } from "@/types/control/psp-connection";

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
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {methods.map((method) => (
            <label
              key={method}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-control border border-[var(--divider)] px-4 text-sm text-foreground transition hover:border-grey-500 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30"
            >
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={value.includes(method)}
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...value, method]
                      : value.filter((candidate) => candidate !== method),
                  )
                }
              />
              {METHOD_LABEL[method]}
            </label>
          ))}
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
