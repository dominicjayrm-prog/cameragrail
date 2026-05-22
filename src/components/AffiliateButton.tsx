interface Props {
  href: string;
  children: React.ReactNode;
  size?: 'lg' | 'md';
}

// Affiliate-tagged outbound link. ASA/FTC rules require nearby disclosure;
// callers should render a "we may earn commission" note near this button.
export function AffiliateButton({ href, children, size = 'lg' }: Props) {
  const base = size === 'lg' ? 'px-6 py-3.5 text-[15px]' : 'px-4 py-2.5 text-sm';
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener nofollow"
      data-affiliate="ebay"
      className={`btn-accent rounded-[12px] font-semibold inline-flex items-center gap-2 ${base}`}
    >
      {children}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>
    </a>
  );
}
