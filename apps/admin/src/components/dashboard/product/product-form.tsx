"use client";

import { useId, useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FloatingInput } from "@/components/shared/floating-input";
import { TextField } from "@/components/form/text-field";
import { CollapsibleFormSection } from "./collapsible-form-section";
import { RichTextEditor } from "./rich-text-editor";
import { UploadDropzone } from "./upload-dropzone";

const CATEGORIES = [
  "Shirts",
  "T-shirts",
  "Jeans",
  "Leather",
  "Accessories",
  "Suits",
  "Blazers",
  "Trousers",
  "Waistcoats",
  "Apparel",
  "Shoes",
  "Backpacks and bags",
  "Bracelets",
  "Face masks",
];

const COLOR_OPTIONS = ["Red", "Blue", "Green", "Yellow", "Black", "White", "Purple", "Orange"];
const SIZE_OPTIONS = ["6", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13"];

interface ProductFormValues {
  productName?: string;
  subDescription?: string;
  content?: string;
  images?: string[];
  productCode?: string;
  productSku?: string;
  quantity?: string;
  category?: string;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  gender?: string[];
  saleLabel?: string;
  newLabel?: string;
  regularPrice?: string;
  salePrice?: string;
  taxIncluded?: boolean;
  tax?: string;
  published?: boolean;
}

interface ProductFormProps {
  mode: "create" | "edit";
  defaultValues?: ProductFormValues;
  onSubmit?: (values: ProductFormValues) => void;
}

function MultiSelectBox({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(opt: string) {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  }

  const fieldId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label id={fieldId} className="select-none text-sm font-medium text-grey-800">
        {label}
      </label>
      <div className="flex min-h-12 w-full items-center rounded-control border border-[var(--divider)] px-3.5 py-2 transition-colors focus-within:border-grey-800">
        <div className="flex w-full flex-wrap gap-1">
          {value.map((v) => (
            <span
              key={v}
              className="flex items-center gap-1 rounded-md bg-grey-200 px-2 py-0.5 text-xs font-medium text-grey-700"
            >
              {v}
              <button
                type="button"
                onClick={() => toggle(v)}
                className="text-grey-500 hover:text-grey-800"
              >
                ×
              </button>
            </span>
          ))}
          <Select
            value=""
            onValueChange={(v) => {
              if (v) toggle(v);
            }}
          >
            <SelectTrigger
              aria-labelledby={fieldId}
              className="h-auto flex-1 border-none px-0 py-0 text-sm text-grey-400"
            >
              <SelectValue
                placeholder={value.length === 0 ? "Select..." : "Add more..."}
              />
            </SelectTrigger>
            <SelectContent>
              {options
                .filter((o) => !value.includes(o))
                .map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function TagsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addTag() {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div className="flex min-h-14 w-full items-center rounded-lg border border-[var(--divider)] px-3.5 py-2 transition-colors focus-within:border-grey-800">
      <div className="flex w-full flex-wrap gap-1.5">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex h-6 items-center gap-1 rounded-lg bg-info/16 px-2 text-xs font-normal text-info-dark"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-grey-500 hover:text-grey-800"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          aria-label="Tags"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={value.length === 0 ? "Tags" : "Add tag..."}
          className="flex-1 min-w-[80px] bg-transparent text-sm text-foreground outline-none placeholder:text-grey-400"
        />
      </div>
    </div>
  );
}

function SwitchWithInput({
  switchLabel,
  inputValue,
  onInputChange,
  enabled,
  onEnabledChange,
}: {
  switchLabel: string;
  inputValue: string;
  onInputChange: (v: string) => void;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <Switch
        checked={enabled}
        onCheckedChange={onEnabledChange}
        className="shrink-0"
      />
      <input
        type="text"
        aria-label={switchLabel}
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        disabled={!enabled}
        placeholder={switchLabel}
        className="flex-1 rounded-lg border border-[var(--divider)] bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-grey-400 disabled:cursor-not-allowed disabled:opacity-50 focus:border-grey-800"
      />
    </div>
  );
}

export function ProductForm({ mode, defaultValues = {}, onSubmit }: ProductFormProps) {
  // Details state — read-only fields (FloatingInput uses uncontrolled defaultValue)
  const productName = defaultValues.productName ?? "";
  const subDescription = defaultValues.subDescription ?? "";
  const rteDefault = defaultValues.content ?? "";

  // Properties state
  const productCode = defaultValues.productCode ?? "";
  const productSku = defaultValues.productSku ?? "";
  const quantity = defaultValues.quantity ?? "0";
  const categoryId = useId();
  const [category, setCategory] = useState(defaultValues.category ?? "T-shirts");
  const [colors, setColors] = useState<string[]>(defaultValues.colors ?? []);
  const [sizes, setSizes] = useState<string[]>(defaultValues.sizes ?? []);
  const [tags, setTags] = useState<string[]>(defaultValues.tags ?? []);
  const [gender, setGender] = useState<string[]>(defaultValues.gender ?? []);
  const [saleEnabled, setSaleEnabled] = useState(false);
  const [saleLabel, setSaleLabel] = useState(defaultValues.saleLabel ?? "");
  const [newEnabled, setNewEnabled] = useState(false);
  const [newLabel, setNewLabel] = useState(defaultValues.newLabel ?? "");

  // Pricing state
  const [regularPrice, setRegularPrice] = useState(defaultValues.regularPrice ?? "");
  const [salePrice, setSalePrice] = useState(defaultValues.salePrice ?? "");
  const [taxIncluded, setTaxIncluded] = useState(defaultValues.taxIncluded ?? false);
  const [tax, setTax] = useState(defaultValues.tax ?? "");

  // Footer
  const [published, setPublished] = useState(defaultValues.published ?? true);

  function toggleGender(g: string) {
    setGender((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  }

  const submitLabel = mode === "create" ? "Create product" : "Save changes";

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      {/* Section 1: Details */}
      <CollapsibleFormSection
        title="Details"
        subtitle="Title, short description, image..."
      >
        <div className="space-y-5">
          <FloatingInput
            label="Product name"
            defaultValue={productName}
          />
          <FloatingInput
            label="Sub description"
            defaultValue={subDescription}
            multiline
            rows={3}
          />
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">
              Content
            </p>
            <RichTextEditor defaultValue={rteDefault} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">
              Images
            </p>
            <UploadDropzone initialImages={defaultValues.images ?? []} />
          </div>
        </div>
      </CollapsibleFormSection>

      {/* Section 2: Properties */}
      <CollapsibleFormSection
        title="Properties"
        subtitle="Additional functions and attributes..."
      >
        <div className="space-y-5">
          {/* Product code / SKU — 2 cols on desktop */}
          <div className="grid grid-cols-1 gap-5 mmd:grid-cols-2">
            <FloatingInput label="Product code" defaultValue={productCode} />
            <FloatingInput label="Product SKU" defaultValue={productSku} />
          </div>

          {/* Quantity / Category */}
          <div className="grid grid-cols-1 gap-5 mmd:grid-cols-2">
            <FloatingInput label="Quantity" defaultValue={quantity} type="number" />
            <div className="flex flex-col gap-1.5">
              <label
                id={categoryId}
                className="select-none text-sm font-medium text-grey-800"
              >
                Category
              </label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger
                  aria-labelledby={categoryId}
                  className="h-12 w-full rounded-control border-[var(--divider)] pl-3.5 pr-3 text-sm text-foreground focus-within:border-grey-800 focus-within:ring-1 focus-within:ring-inset focus-within:ring-grey-800"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Colors / Sizes */}
          <div className="grid grid-cols-1 gap-5 mmd:grid-cols-2">
            <MultiSelectBox
              label="Colors"
              options={COLOR_OPTIONS}
              value={colors}
              onChange={setColors}
            />
            <MultiSelectBox
              label="Sizes"
              options={SIZE_OPTIONS}
              value={sizes}
              onChange={setSizes}
            />
          </div>

          {/* Tags */}
          <TagsInput value={tags} onChange={setTags} />

          {/* Gender */}
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">
              Gender
            </p>
            <div className="flex items-center gap-6">
              {["Men", "Women", "Kids"].map((g) => (
                <label
                  key={g}
                  className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={gender.includes(g)}
                    onChange={() => toggleGender(g)}
                    className="size-4 rounded border-grey-400 accent-grey-800"
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>

          <hr className="border-[var(--divider)]" />

          {/* Sale label */}
          <SwitchWithInput
            switchLabel="Sale label"
            inputValue={saleLabel}
            onInputChange={setSaleLabel}
            enabled={saleEnabled}
            onEnabledChange={setSaleEnabled}
          />

          {/* New label */}
          <SwitchWithInput
            switchLabel="New label"
            inputValue={newLabel}
            onInputChange={setNewLabel}
            enabled={newEnabled}
            onEnabledChange={setNewEnabled}
          />
        </div>
      </CollapsibleFormSection>

      {/* Section 3: Pricing */}
      <CollapsibleFormSection title="Pricing" subtitle="Price related inputs">
        <div className="space-y-5">
          <TextField
            label="Regular price"
            value={regularPrice}
            onChange={setRegularPrice}
            placeholder="0.00"
            startAdornment="$"
          />
          <TextField
            label="Sale price"
            value={salePrice}
            onChange={setSalePrice}
            placeholder="0.00"
            startAdornment="$"
          />
          <div className="flex items-center gap-3">
            <Switch
              checked={taxIncluded}
              onCheckedChange={setTaxIncluded}
            />
            <span className="text-sm text-foreground">
              Price includes taxes
            </span>
          </div>
          <TextField
            label="Tax (%)"
            value={tax}
            onChange={setTax}
            placeholder="0.00"
            startAdornment="%"
          />
        </div>
      </CollapsibleFormSection>

      {/* Footer */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <Switch
            checked={published}
            onCheckedChange={setPublished}
          />
          <span className="text-sm font-semibold text-foreground">
            Publish
          </span>
        </div>
        <button
          type="button"
          onClick={() =>
            onSubmit?.({
              productName,
              subDescription,
              productCode,
              productSku,
              quantity,
              category,
              colors,
              sizes,
              tags,
              gender,
              saleLabel: saleEnabled ? saleLabel : undefined,
              newLabel: newEnabled ? newLabel : undefined,
              regularPrice,
              salePrice,
              taxIncluded,
              tax,
              published,
            })
          }
          className="h-12 rounded-lg bg-foreground px-4 text-sm font-bold text-card transition-opacity hover:opacity-90"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
