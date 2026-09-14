interface TableNoDataProps {
  query?: string;
}

export function TableNoData({ query }: TableNoDataProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-20 text-center">
      <span className="text-xl font-semibold text-foreground">No data</span>
      {query ? (
        <span className="text-lg text-grey-500">
          No results found for &ldquo;{query}&rdquo;
        </span>
      ) : null}
    </div>
  );
}
