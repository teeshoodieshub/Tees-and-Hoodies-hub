import { Helmet } from "react-helmet-async";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  DEFAULT_IMAGE_ALT,
  OPEN_GRAPH_IMAGE_HEIGHT,
  OPEN_GRAPH_IMAGE_WIDTH,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "@/lib/seo";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noIndex?: boolean;
}

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogImageAlt = DEFAULT_IMAGE_ALT,
  ogType = "website",
  jsonLd,
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} - ${SITE_NAME}` : `${SITE_NAME} - Premium Apparel from Accra, Ghana`;
  const fullCanonical = canonical ? absoluteUrl(canonical) : SITE_URL;
  const fullOgImage = absoluteUrl(ogImage);
  const isDefaultOgImage = fullOgImage === absoluteUrl(DEFAULT_IMAGE);
  const ogImageType = /\.(jpe?g)(\?|$)/i.test(fullOgImage) ? "image/jpeg" : "image/png";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}
      />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />

      <link rel="canonical" href={fullCanonical} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:secure_url" content={fullOgImage} />
      <meta property="og:image:type" content={ogImageType} />
      {isDefaultOgImage && <meta property="og:image:width" content={String(OPEN_GRAPH_IMAGE_WIDTH)} />}
      {isDefaultOgImage && <meta property="og:image:height" content={String(OPEN_GRAPH_IMAGE_HEIGHT)} />}
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_GH" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
