import { adminFetch } from "./auth";

interface MasterResponseWire {
  id: string;
  code: string;
  name: string;
  status: 1 | 2;
  version: number;
}

interface PagedResultWire<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrgUnitView {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

const PAGE_LIMIT = 25;
const MAX_TOTAL_PAGES = 100;
const PAGE_BATCH_SIZE = 4;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CODE_PATTERN = /^[a-z0-9_]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeInteger(value: unknown, minimum: number): value is number {
  return Number.isSafeInteger(value) && (value as number) >= minimum;
}

function parseMaster(value: unknown): MasterResponseWire {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !UUID_PATTERN.test(value.id) ||
    typeof value.code !== "string" ||
    value.code.length === 0 ||
    value.code.length > 64 ||
    !CODE_PATTERN.test(value.code) ||
    typeof value.name !== "string" ||
    value.name.length > 200 ||
    value.name.trim().length === 0 ||
    (value.status !== 1 && value.status !== 2) ||
    !isSafeInteger(value.version, 0)
  ) {
    throw new Error("Invalid ORG master response");
  }

  return {
    id: value.id,
    code: value.code,
    name: value.name,
    status: value.status,
    version: value.version,
  };
}

function parsePage(value: unknown, expectedPage: number): PagedResultWire<MasterResponseWire> {
  if (
    !isRecord(value) ||
    !Array.isArray(value.items) ||
    !isSafeInteger(value.page, 1) ||
    value.page !== expectedPage ||
    value.limit !== PAGE_LIMIT ||
    !isSafeInteger(value.total, 0) ||
    !isSafeInteger(value.totalPages, 0) ||
    value.totalPages > MAX_TOTAL_PAGES ||
    value.totalPages !== Math.ceil(value.total / PAGE_LIMIT)
  ) {
    throw new Error("Invalid ORG page response");
  }

  return {
    items: value.items.map(parseMaster),
    page: value.page,
    limit: value.limit,
    total: value.total,
    totalPages: value.totalPages,
  };
}

function mapMaster(value: MasterResponseWire): OrgUnitView {
  return {
    id: value.id,
    code: value.code,
    name: value.name,
    isActive: value.status === 1,
  };
}

async function fetchPage(
  basePath: string,
  page: number,
): Promise<PagedResultWire<MasterResponseWire>> {
  const response = await adminFetch(`${basePath}?page=${page}&limit=${PAGE_LIMIT}`);
  if (!response.ok) throw new Error(`${basePath} ${response.status}`);
  return parsePage(await response.json(), page);
}

export async function getOrgList(basePath: string): Promise<OrgUnitView[]> {
  const first = await fetchPage(basePath, 1);
  const pages: PagedResultWire<MasterResponseWire>[] = [first];

  for (let batchStart = 2; batchStart <= first.totalPages; batchStart += PAGE_BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + PAGE_BATCH_SIZE, first.totalPages + 1);
    const batch = await Promise.all(
      Array.from({ length: batchEnd - batchStart }, (_, index) =>
        fetchPage(basePath, batchStart + index),
      ),
    );
    if (batch.some((page) => page.totalPages !== first.totalPages)) {
      throw new Error("Invalid ORG page anchor");
    }
    pages.push(...batch);
  }

  return pages.flatMap((page) => page.items.map(mapMaster));
}

export async function getOrgDetail(basePath: string, id: string): Promise<OrgUnitView | null> {
  const response = await adminFetch(`${basePath}/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${basePath}/${id} ${response.status}`);
  return mapMaster(parseMaster(await response.json()));
}
