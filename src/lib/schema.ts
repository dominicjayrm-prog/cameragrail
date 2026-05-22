// JSON-LD helpers for structured data. Catalogue pages emit Product +
// AggregateOffer, FAQ blocks emit FAQPage, every page emits BreadcrumbList.
import { absoluteUrl, SITE_NAME } from './site';
import type { Camera } from './types';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/logo.png'),
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/browse')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbsJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

export function cameraProductJsonLd(camera: Camera) {
  const offers =
    camera.value_low != null && camera.value_high != null
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'GBP',
          lowPrice: (camera.value_low / 100).toFixed(2),
          highPrice: (camera.value_high / 100).toFixed(2),
          offerCount: 1,
          availability: 'https://schema.org/InStock',
        }
      : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${camera.brand} ${camera.model}`,
    brand: { '@type': 'Brand', name: camera.brand },
    category: camera.format,
    description:
      camera.history?.slice(0, 280) ??
      `${camera.brand} ${camera.model} specifications, production history, and current market value.`,
    image: camera.hero_image_url ?? undefined,
    offers,
  };
}

export function faqPageJsonLd(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

export function collectionPageJsonLd(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: absoluteUrl(path),
  };
}
