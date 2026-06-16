export function LinearProgress() {
  return (
    <div className="relative h-1 w-full overflow-hidden rounded-full">
      <span
        className="absolute inset-y-0 rounded-full"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary-light), var(--color-primary))",
          animation:
            "progress-bar1 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite",
        }}
      />
      <span
        className="absolute inset-y-0 rounded-full"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary-light), var(--color-primary))",
          animation:
            "progress-bar2 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite",
        }}
      />
    </div>
  );
}
