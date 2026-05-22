export function Logo({ size = 32 }: { size?: number }) {
  const inner = Math.round(size * 0.47);
  const dot = Math.round(size * 0.125);
  return (
    <div
      className="bg-navy rounded-[9px] flex items-center justify-center relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div
        className="rounded-full border-2 border-blue-soft"
        style={{ width: inner, height: inner }}
      />
      <div
        className="absolute bg-blue rounded-full"
        style={{ width: dot, height: dot, top: size * 0.19, right: size * 0.22 }}
      />
    </div>
  );
}
