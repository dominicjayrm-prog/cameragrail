import Link from 'next/link';
import { Breadcrumbs } from './Breadcrumbs';

interface Props {
  title: string;
  intro: string;
  comingSoon?: string;
  breadcrumbs: Array<{ label: string; href: string }>;
}

// Placeholder for routes that are linked from the nav/footer but whose full
// implementation lands in a later phase (community submissions, valuation
// tool, account, editorial pages). The stub exists so internal links resolve
// and the SEO crawl is clean.
export function StubPage({ title, intro, comingSoon, breadcrumbs }: Props) {
  return (
    <div className="max-w-page mx-auto px-7 py-10">
      <Breadcrumbs items={breadcrumbs} />
      <header className="mt-6 mb-8">
        <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] leading-[1.05] text-navy">
          {title}
        </h1>
        <p className="text-[17px] text-slate mt-3 max-w-[760px]">{intro}</p>
      </header>
      {comingSoon ? (
        <div className="bg-white border border-line rounded-card p-6">
          <p className="text-[12.5px] font-bold tracking-[0.12em] text-blue uppercase mb-2">
            Coming soon
          </p>
          <p className="text-slate leading-relaxed">{comingSoon}</p>
          <p className="mt-4">
            <Link href="/browse" className="lu text-navy font-semibold">
              Browse the catalogue while you wait →
            </Link>
          </p>
        </div>
      ) : null}
    </div>
  );
}
