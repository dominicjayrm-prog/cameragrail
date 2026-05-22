interface Props {
  href: string;
  children: React.ReactNode;
  className?: string;
}

// Outbound link wrapper that enforces `rel="nofollow noopener noreferrer"`
// and `target="_blank"`. Non-negotiable: external links should never share
// our SEO authority by default, and `noopener noreferrer` is a security
// requirement for any new-tab link.
export function ExternalLink({ href, children, className }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
