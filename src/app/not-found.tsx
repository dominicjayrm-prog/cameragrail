import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-[640px] mx-auto px-7 py-24 text-center">
      <p className="text-[12.5px] font-bold tracking-[0.12em] text-blue uppercase mb-3">
        404
      </p>
      <h1 className="font-head text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.03em] leading-[1.05] text-navy mb-4">
        We could not find that page.
      </h1>
      <p className="text-[17px] text-slate mb-7">
        The catalogue is still growing. The model you are looking for may not be in
        yet, or the URL has moved.
      </p>
      <div className="flex gap-3 justify-center">
        <Link href="/browse" className="btn-primary px-6 py-3 rounded-pill font-semibold">
          Browse the archive
        </Link>
        <Link
          href="/submit"
          className="bg-transparent text-navy border-[1.5px] border-[#C2D0E4] px-6 py-3 rounded-pill font-semibold hover:bg-paper transition-colors"
        >
          Submit the model
        </Link>
      </div>
    </div>
  );
}
