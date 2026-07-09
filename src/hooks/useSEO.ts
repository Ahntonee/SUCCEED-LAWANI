import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  article?: { publishedTime?: string; author?: string; tags?: string[] };
}

const SITE = 'Succeed Michael Lawani';
const DEFAULT_DESC = 'Gospel musician, visual artist, and digital marketing strategist from Lagos, Nigeria. Creator of soul-stirring music and the Succeeder Designs brand.';
const DEFAULT_IMAGE = 'https://www.succeedlawani.com/og-image.jpg';

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

export function useSEO({ title, description, image, url, type = 'website', article }: SEOProps = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : `${SITE} — Music, Gallery & Digital Marketing`;
    const desc = description || DEFAULT_DESC;
    const img = image || DEFAULT_IMAGE;
    const pageUrl = url || window.location.href;

    document.title = fullTitle;

    setMeta('name', 'description', desc);
    setMeta('property', 'og:site_name', SITE);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:image', img);
    setMeta('property', 'og:url', pageUrl);
    setMeta('property', 'og:type', type);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', img);

    if (type === 'article' && article) {
      if (article.publishedTime) setMeta('property', 'article:published_time', article.publishedTime);
      if (article.author)        setMeta('property', 'article:author', article.author);
    }

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
      ?? (() => { const l = document.createElement('link'); l.rel = 'canonical'; document.head.appendChild(l); return l; })();
    canonical.href = pageUrl;
  }, [title, description, image, url, type, article]);
}
