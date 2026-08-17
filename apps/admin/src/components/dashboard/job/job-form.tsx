"use client";

import { useState } from "react";
import { Clock, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSectionCard } from "./form-section-card";
import { RichTextEditor } from "./rich-text-editor";
import type { Job, EmploymentType, ExperienceLevel, SalaryMode } from "@/types/job";
import {
  JOB_ROLES,
  JOB_SKILLS,
  JOB_SCHEDULES,
  JOB_LOCATIONS,
  JOB_BENEFITS,
} from "@/lib/mock/job";

// ── Field label ──────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-sm font-semibold leading-[22px] text-grey-800">{children}</p>
  );
}

// ── Simple text input ────────────────────────────────────────────────────────
function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="h-14 w-full rounded-control border border-[var(--divider)] bg-transparent px-3.5 text-sm text-grey-800 placeholder:text-grey-400 outline-none focus:border-grey-800 focus:ring-1 focus:ring-inset focus:ring-grey-800"
    />
  );
}

// ── Checkbox row ─────────────────────────────────────────────────────────────
function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-grey-700">
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-[4px] border-2 transition-colors",
          checked
            ? "border-foreground bg-foreground text-card"
            : "border-grey-400 bg-transparent"
        )}
        onClick={() => onChange(!checked)}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => e.key === " " && onChange(!checked)}
      >
        {checked && (
          <svg viewBox="0 0 12 10" className="size-3" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <polyline points="1,5 4.5,8.5 11,1" />
          </svg>
        )}
      </span>
      {label}
    </label>
  );
}

// ── Radio item ───────────────────────────────────────────────────────────────
function RadioItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-grey-700">
      <span
        className={cn(
          "flex size-4 items-center justify-center rounded-full border-2 transition-colors",
          checked ? "border-primary bg-primary" : "border-grey-400 bg-transparent"
        )}
        onClick={onChange}
        role="radio"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => e.key === " " && onChange()}
      >
        {checked && <span className="size-2 rounded-full bg-white" />}
      </span>
      {label}
    </label>
  );
}

// ── Simple select ────────────────────────────────────────────────────────────
function SimpleSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? "")}>
      <SelectTrigger
        aria-label={placeholder ?? "Role"}
        className="h-14 w-full text-sm text-grey-800"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ── Multi-chip select ────────────────────────────────────────────────────────
function MultiChipSelect({
  selected,
  onChange,
  options,
  placeholder,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
  options: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
    );
  };

  const remove = (opt: string) => {
    onChange(selected.filter((s) => s !== opt));
  };

  return (
    <div className="relative">
      <div
        className="flex min-h-14 w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-control border border-[var(--divider)] bg-transparent px-3 py-2 focus-within:border-grey-800"
        onClick={() => setOpen((o) => !o)}
      >
        {selected.map((s) => (
          <span
            key={s}
            className="inline-flex h-6 items-center gap-1 rounded-[8px] bg-info/16 px-2 text-xs font-normal text-info-dark"
          >
            {s}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(s);
              }}
              className="flex size-3.5 items-center justify-center rounded-full text-grey-500 hover:text-grey-800"
              aria-label={`Remove ${s}`}
            >
              ×
            </button>
          </span>
        ))}
        <span className="flex-1 text-sm text-grey-400">{placeholder}</span>
        <svg className="size-4 shrink-0 text-grey-400" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
          />
        </svg>
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-xl bg-card py-1 shadow-[0_0_2px_rgba(145,158,171,0.24),-20px_20px_40px_-4px_rgba(145,158,171,0.24)]">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={cn(
                "flex w-full items-center px-4 py-2 text-sm transition-colors hover:bg-grey-100",
                selected.includes(opt) ? "font-semibold text-grey-900" : "text-grey-700"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Location chip select (with flag) ─────────────────────────────────────────
function LocationSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (code: string) => {
    onChange(
      selected.includes(code)
        ? selected.filter((s) => s !== code)
        : [...selected, code]
    );
  };

  const remove = (code: string) => onChange(selected.filter((s) => s !== code));

  return (
    <div className="relative">
      <div
        className="flex min-h-14 w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-control border border-[var(--divider)] bg-transparent px-3 py-2 focus-within:border-grey-800"
        onClick={() => setOpen((o) => !o)}
      >
        {selected.map((code) => {
          const loc = JOB_LOCATIONS.find((l) => l.code === code);
          return (
            <span
              key={code}
              className="inline-flex h-6 items-center gap-1 rounded-[8px] bg-info/16 px-2 text-xs font-normal text-info-dark"
            >
              {loc?.flag} {loc?.code} {loc?.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(code);
                }}
                className="flex size-3.5 items-center justify-center rounded-full text-grey-500 hover:text-grey-800"
                aria-label={`Remove ${loc?.name}`}
              >
                ×
              </button>
            </span>
          );
        })}
        <span className="flex-1 text-sm text-grey-400">+ Locations</span>
        <svg className="size-4 shrink-0 text-grey-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-xl bg-card py-1 shadow-[0_0_2px_rgba(145,158,171,0.24),-20px_20px_40px_-4px_rgba(145,158,171,0.24)]">
          {JOB_LOCATIONS.map((loc) => (
            <button
              key={loc.code}
              type="button"
              onClick={() => toggle(loc.code)}
              className={cn(
                "flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-grey-100",
                selected.includes(loc.code) ? "font-semibold text-grey-900" : "text-grey-700"
              )}
            >
              {loc.flag} {loc.code} {loc.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Date field ───────────────────────────────────────────────────────────────
function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative flex h-14 w-full items-center rounded-control border border-[var(--divider)] bg-transparent px-3.5 focus-within:border-grey-800">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="MM/DD/YYYY"
        aria-label="Expired date"
        className="flex-1 bg-transparent text-sm text-grey-800 placeholder:text-grey-400 outline-none"
      />
      <button type="button" aria-label="Choose date" className="shrink-0 text-grey-400 hover:text-grey-700">
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>
    </div>
  );
}

// ── Salary field ─────────────────────────────────────────────────────────────
function SalaryField({
  mode,
  onModeChange,
  amount,
  onAmountChange,
  negotiable,
  onNegotiableChange,
}: {
  mode: SalaryMode;
  onModeChange: (m: SalaryMode) => void;
  amount: string;
  onAmountChange: (v: string) => void;
  negotiable: boolean;
  onNegotiableChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Hourly / Custom toggle cards */}
      <div className="grid grid-cols-2 gap-4">
        {(["Hourly", "Custom"] as SalaryMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-control border-2 py-5 transition-colors",
              mode === m
                ? "border-grey-800 bg-transparent"
                : "border-grey-200 bg-transparent hover:border-grey-300"
            )}
          >
            {m === "Hourly" ? (
              <Clock className="size-6 text-grey-700" />
            ) : (
              <Layers className="size-6 text-grey-700" />
            )}
            <span className="text-sm font-semibold text-grey-800">{m}</span>
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div className="flex h-14 items-center rounded-control border border-[var(--divider)] bg-transparent px-3.5 focus-within:border-grey-800">
        <span className="mr-2 text-sm text-grey-500">$</span>
        <input
          type="text"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.00"
          disabled={negotiable}
          aria-label="Salary amount"
          className="flex-1 bg-transparent text-sm text-grey-800 placeholder:text-grey-400 outline-none disabled:opacity-40"
        />
      </div>

      {/* Negotiable switch */}
      <label className="flex items-center gap-3 cursor-pointer">
        <Switch
          checked={negotiable}
          onCheckedChange={onNegotiableChange}
        />
        <span className="text-sm text-grey-700">Salary is negotiable</span>
      </label>
    </div>
  );
}

// ── Main form ────────────────────────────────────────────────────────────────
export interface JobFormProps {
  /** When provided, form pre-fills and shows Edit mode labels */
  currentJob?: Job;
}

const EMPLOYMENT_TYPES: EmploymentType[] = [
  "Full-time",
  "Part-time",
  "On demand",
  "Negotiable",
];

const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "No experience",
  "1 year exp",
  "2 year exp",
  "> 3 year exp",
];

export function JobForm({ currentJob }: JobFormProps) {
  const isEdit = Boolean(currentJob);

  // ── Details state ─────────────────────────────────────────────────────────
  const [title, setTitle] = useState(currentJob?.title ?? "");

  // ── Properties state ──────────────────────────────────────────────────────
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>(
    currentJob ? [currentJob.employmentType] : []
  );
  const [experience, setExperience] = useState<ExperienceLevel>(
    currentJob?.experience ?? "1 year exp"
  );
  const [role, setRole] = useState(currentJob?.role ?? "CTO");
  const [skills, setSkills] = useState<string[]>(currentJob?.skills ?? []);
  const [schedule, setSchedule] = useState<string[]>(
    currentJob?.workingSchedule ?? []
  );
  const [locations, setLocations] = useState<string[]>(
    currentJob?.locations ?? []
  );
  const [expired, setExpired] = useState(currentJob?.expired ?? "");
  const [salaryMode, setSalaryMode] = useState<SalaryMode>("Hourly");
  const [salaryAmount, setSalaryAmount] = useState(
    currentJob?.salaryAmount ??
    (currentJob && currentJob.salary !== "Negotiable" ? currentJob.salary.replace("$", "") : "")
  );
  const [negotiable, setNegotiable] = useState(
    currentJob?.salary === "Negotiable"
  );
  const [benefits, setBenefits] = useState<string[]>(currentJob?.benefits ?? []);
  const [publish, setPublish] = useState(
    currentJob ? currentJob.status === "Published" : true
  );

  const toggleEmploymentType = (t: EmploymentType) => {
    setEmploymentTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const toggleBenefit = (b: string) => {
    setBenefits((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission: in a real app, dispatch server action here
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-[720px] space-y-10">
      {/* Section 1 — Details */}
      <FormSectionCard title="Details" caption="Title, short description, image...">
        <div className="space-y-5">
          <div>
            <FieldLabel>Title</FieldLabel>
            <TextInput
              value={title}
              onChange={setTitle}
              placeholder="Ex: Software engineer..."
            />
          </div>
          <div>
            <FieldLabel>Content</FieldLabel>
            <RichTextEditor
              initialHtml={
                currentJob?.descriptionSections
                  ? currentJob.descriptionSections
                      .map((s) => {
                        const heading = `<h6>${s.heading}</h6>`;
                        const body = s.paragraph
                          ? `<p>${s.paragraph}</p>`
                          : s.bullets
                            ? `<ul>${s.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`
                            : "";
                        return heading + body;
                      })
                      .join("")
                  : ""
              }
            />
          </div>
        </div>
      </FormSectionCard>

      {/* Section 2 — Properties */}
      <FormSectionCard
        title="Properties"
        caption="Additional functions and attributes..."
      >
        <div className="space-y-6">
          {/* Employment type */}
          <div>
            <FieldLabel>Employment type</FieldLabel>
            <div className="grid grid-cols-3 gap-x-6 gap-y-3 sm:flex sm:flex-wrap">
              {EMPLOYMENT_TYPES.map((t) => (
                <CheckboxItem
                  key={t}
                  label={t}
                  checked={employmentTypes.includes(t)}
                  onChange={() => toggleEmploymentType(t)}
                />
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <FieldLabel>Experience</FieldLabel>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {EXPERIENCE_LEVELS.map((lvl) => (
                <RadioItem
                  key={lvl}
                  label={lvl}
                  checked={experience === lvl}
                  onChange={() => setExperience(lvl)}
                />
              ))}
            </div>
          </div>

          {/* Role */}
          <div>
            <FieldLabel>Role</FieldLabel>
            <SimpleSelect
              value={role}
              onChange={setRole}
              options={JOB_ROLES}
            />
          </div>

          {/* Skills */}
          <div>
            <FieldLabel>Skills</FieldLabel>
            <MultiChipSelect
              selected={skills}
              onChange={setSkills}
              options={JOB_SKILLS}
              placeholder="+ Skills"
            />
          </div>

          {/* Working schedule */}
          <div>
            <FieldLabel>Working schedule</FieldLabel>
            <MultiChipSelect
              selected={schedule}
              onChange={setSchedule}
              options={JOB_SCHEDULES}
              placeholder="+ Schedule"
            />
          </div>

          {/* Locations */}
          <div>
            <FieldLabel>Locations</FieldLabel>
            <LocationSelect selected={locations} onChange={setLocations} />
          </div>

          {/* Expired date */}
          <div>
            <FieldLabel>Expired</FieldLabel>
            <DateField value={expired} onChange={setExpired} />
          </div>

          {/* Salary */}
          <div>
            <FieldLabel>Salary</FieldLabel>
            <SalaryField
              mode={salaryMode}
              onModeChange={setSalaryMode}
              amount={salaryAmount}
              onAmountChange={setSalaryAmount}
              negotiable={negotiable}
              onNegotiableChange={setNegotiable}
            />
          </div>

          {/* Benefits */}
          <div>
            <FieldLabel>Benefits</FieldLabel>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {JOB_BENEFITS.map((b) => (
                <CheckboxItem
                  key={b}
                  label={b}
                  checked={benefits.includes(b)}
                  onChange={() => toggleBenefit(b)}
                />
              ))}
            </div>
          </div>
        </div>
      </FormSectionCard>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-3">
          <Switch
            checked={publish}
            onCheckedChange={setPublish}
          />
          <span className="text-sm font-semibold text-grey-800">Publish</span>
        </label>

        <button
          type="submit"
          className="rounded-control bg-foreground h-12 px-4 text-sm font-bold text-card transition-opacity hover:opacity-90"
        >
          {isEdit ? "Save changes" : "Create job"}
        </button>
      </div>
    </form>
  );
}
