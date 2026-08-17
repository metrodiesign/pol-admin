"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny reactive in-memory store for the control plane. Makes mock mutations
 * behave like a real app: a change made on a detail page persists and is
 * reflected on the list and stat cards when you navigate back, because the
 * store is a module singleton that survives client-side navigation (the data
 * is not reloaded from the seed constant on every mount).
 *
 * No new dependency — a ~20-line observable + useSyncExternalStore.
 * ponytail: in-memory only; a real app would back this with the API/DB.
 */
export interface ControlStore<T> {
  get: () => T[];
  set: (next: T[]) => void;
  update: (id: string, fn: (item: T) => T) => void;
  add: (item: T) => void;
  byId: (id: string | undefined) => T | undefined;
  subscribe: (listener: () => void) => () => void;
}

export function createControlStore<T extends { id: string }>(
  seed: T[],
): ControlStore<T> {
  let data = seed;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  return {
    get: () => data,
    set: (next) => {
      data = next;
      emit();
    },
    update: (id, fn) => {
      data = data.map((x) => (x.id === id ? fn(x) : x));
      emit();
    },
    add: (item) => {
      data = [item, ...data];
      emit();
    },
    byId: (id) => (id ? data.find((x) => x.id === id) : undefined),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Subscribe a component to a store. SSR/first-client read returns the seed. */
export function useControlStore<T extends { id: string }>(
  store: ControlStore<T>,
): T[] {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
