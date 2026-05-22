import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { VALUE_DISCLAIMER } from '@/lib/site';

export const metadata: Metadata = {
  title: 'How CameraGrail Values Work',
  description:
    'How we calculate camera values from real sold-listing data, what we strip out as outliers, and why community submissions matter.',
  alternates: { canonical: '/how-values-work' },
};

export default function HowValuesWorkPage() {
  return (
    <article className="max-w-[760px] mx-auto px-7 py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'How values work', href: '/how-values-work' },
        ]}
      />
      <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] leading-[1.05] text-navy mt-6 mb-6">
        How values work
      </h1>
      <div className="space-y-5 leading-[1.7] text-ink">
        <p>
          Every value on CameraGrail comes from real recent sales. We pull sold and
          completed listings from eBay (and Reverb for higher-end gear), strip the
          obvious outliers, then compute a condition-adjusted range.
        </p>
        <h2 className="font-head text-2xl font-bold text-navy mt-8">
          What feeds the price
        </h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong>eBay sold listings.</strong> The primary source. Where most real
            camera transactions happen.
          </li>
          <li>
            <strong>Reverb sold data.</strong> Supplementary, especially strong for
            higher-end and lens listings.
          </li>
          <li>
            <strong>Community-logged sales.</strong> Verified collector reports fill
            gaps for thinly traded models.
          </li>
        </ol>
        <h2 className="font-head text-2xl font-bold text-navy mt-8">
          Outlier handling
        </h2>
        <p>
          We strip listings that are 3x above or below the median for that model
          (broken &quot;for parts&quot; bodies, mistitled lots, kit-versus-body
          confusion). The resulting low and high points reflect realistic transaction
          prices, not extremes.
        </p>
        <h2 className="font-head text-2xl font-bold text-navy mt-8">
          Condition adjustment
        </h2>
        <p>
          Each model carries four condition tiers, mint, excellent, good, and for
          parts. The condition table on every camera page shows the range you can
          expect in each tier today.
        </p>
        <h2 className="font-head text-2xl font-bold text-navy mt-8">
          What CameraGrail is not
        </h2>
        <p>{VALUE_DISCLAIMER} For insurance or auction-grade appraisals you should consult a specialist.</p>
      </div>
    </article>
  );
}
