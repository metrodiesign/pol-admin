"use client";

import { Star, EllipsisVertical, Share2, Download, Pencil, Trash2 } from "lucide-react";
import type { FileManagerItem } from "@/lib/mock/file-manager";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
} from "@/components/ui/avatar";
import { FileTypeIcon } from "./file-type-icon";
import { cn } from "@/lib/utils";

interface FileManagerTableRowProps {
  item: FileManagerItem;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onStarToggle: (id: string) => void;
  dense: boolean;
}

export function FileManagerTableRow({
  item,
  selected,
  onSelect,
  onStarToggle,
  dense,
}: FileManagerTableRowProps) {
  const py = dense ? "py-1.5" : "py-3";

  return (
    <TableRow
      className={cn(
        "border-b border-[var(--divider)] transition-colors",
        selected
          ? "bg-[var(--action-selected)]"
          : "hover:bg-[var(--action-hover)]"
      )}
    >
      {/* Checkbox */}
      <TableCell className="w-12 pl-1 pr-0">
        <Checkbox
          checked={selected}
          onChange={onSelect}
          aria-label={`Select ${item.name}`}
        />
      </TableCell>

      {/* Name */}
      <TableCell className={cn("px-4", py)}>
        <div className="flex items-center gap-3">
          <FileTypeIcon type={item.type} />
          <span className="truncate text-sm font-semibold text-foreground">
            {item.name}
          </span>
        </div>
      </TableCell>

      {/* Size */}
      <TableCell className={cn("px-4 text-sm text-foreground", py)}>
        {item.size}
      </TableCell>

      {/* Type */}
      <TableCell className={cn("px-4 text-sm text-foreground", py)}>
        {item.type}
      </TableCell>

      {/* Modified */}
      <TableCell className={cn("px-4", py)}>
        <span className="block text-sm text-foreground">{item.modifiedDate}</span>
        <span className="block text-xs text-grey-500">{item.modifiedTime}</span>
      </TableCell>

      {/* Shared */}
      <TableCell className={cn("px-4", py)}>
        {item.shared.length > 0 && (
          <div className="flex items-center gap-1">
            <AvatarGroup>
              {item.shared.map((av) => (
                <Avatar key={av.src} size="sm">
                  <AvatarImage src={av.src} alt={av.name} />
                  <AvatarFallback>{av.name[0]}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            {item.sharedOverflow > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-success/16 px-1 text-xs font-bold text-success-dark">
                +{item.sharedOverflow}
              </span>
            )}
          </div>
        )}
      </TableCell>

      {/* Actions: star + kebab */}
      <TableCell className={cn("px-2", py)}>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onStarToggle(item.id)}
            aria-label={item.starred ? "Unstar" : "Star"}
            className="inline-flex size-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--action-hover)]"
          >
            <Star
              className="size-4"
              fill={item.starred ? "#FFAB00" : "none"}
              stroke={item.starred ? "#FFAB00" : "currentColor"}
              strokeWidth={1.5}
              style={{ color: item.starred ? "#FFAB00" : "var(--color-grey-500)" }}
            />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-grey-600 hover:text-foreground"
                />
              }
            >
              <EllipsisVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4}>
              <DropdownMenuItem>
                <Share2 className="size-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="size-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pencil className="size-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
