import Link from 'next/link';

interface Crumb {
  label: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="text-ink">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="lu hover:text-ink">
                  {item.label}
                </Link>
              )}
              {!last && <span className="text-slate/60">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
