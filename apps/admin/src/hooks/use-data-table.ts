"use client";

import { useState, useRef } from "react";
import {
  createTable,
  type TableOptions,
  type TableOptionsResolved,
  type RowData,
  type Table,
  type Updater,
  type TableState,
} from "@tanstack/react-table";

/* eslint-disable react-hooks/refs --
   This hook mirrors TanStack Table's documented manual useReactTable pattern,
   which intentionally syncs and reads refs during render. The ref values are not
   used for React rendering decisions, so the rule is a false positive here. */

export function useDataTable<TData extends RowData>(
  options: TableOptions<TData>
): Table<TData> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const resolvedOptions = {
    state: {},
    onStateChange: () => {},
    renderFallbackValue: null,
    ...options,
  } as TableOptionsResolved<TData>;

  const [tableRef] = useState(() => ({
    current: createTable(resolvedOptions),
  }));

  const [state, setState] = useState(() => tableRef.current.initialState);

  tableRef.current.setOptions((prev) => ({
    ...prev,
    ...options,
    state: {
      ...state,
      ...options.state,
    },
    onStateChange: (updater: Updater<TableState>) => {
      setState(updater);
      optionsRef.current.onStateChange?.(updater);
    },
  }));

  return tableRef.current;
}
