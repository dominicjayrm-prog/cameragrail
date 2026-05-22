interface FaqItem {
  q: string;
  a: string;
}

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="bg-white border border-line rounded-card divide-y divide-line">
      {items.map((item) => (
        <details key={item.q} className="group p-5">
          <summary className="cursor-pointer flex items-center justify-between gap-3 list-none">
            <span className="font-head text-base font-semibold text-navy">{item.q}</span>
            <span
              aria-hidden
              className="text-slate transition-transform group-open:rotate-45 text-xl leading-none"
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-slate leading-relaxed text-[15px]">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
