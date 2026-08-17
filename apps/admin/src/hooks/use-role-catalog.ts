"use client";

import { useEffect, useState } from "react";
import { getPermissionCatalog, type PermissionCatalog } from "@/lib/api/admin/role";

interface RoleCatalogState {
  catalog: PermissionCatalog | null;
  loading: boolean;
  error: boolean;
  /** re-fetch (ใช้กับปุ่มลองใหม่). */
  reload: () => void;
}

/**
 * โหลด permission catalog จริง (GET /admin/permissions) ต่อ mount.
 * ใช้ร่วมกันโดย roles-view / create / edit / read แทน mock PERMISSION_CATALOG.
 */
export function useRoleCatalog(): RoleCatalogState {
  const [catalog, setCatalog] = useState<PermissionCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getPermissionCatalog()
      .then((data) => {
        if (active) setCatalog(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  function reload() {
    setLoading(true);
    setError(false);
    setReloadKey((k) => k + 1);
  }

  return { catalog, loading, error, reload };
}
