import type { Product } from "@/data/products";
import type { DbBlogPost } from "@/lib/supabaseApi";

export const SITE_NAME = "Tees & Hoodies Hub";
export const SITE_URL = "https://teesandhoodies.com";
export const BRAND_EMAIL = "hello@teesandhoodies.com";
export const BRAND_INSTAGRAM = "https://www.instagram.com/tees_hoodies_hub";
export const BRAND_TIKTOK = "https://www.tiktok.com/@tees_hoodies_hub";
export const BRAND_SOCIAL_HANDLE = "@tees_hoodies_hub";
export const BRAND_SOCIAL_LINKS = [BRAND_INSTAGRAM, BRAND_TIKTOK];
export const DEFAULT_DESCRIPTION =
  "Premium heavyweight apparel from Accra, Ghana. Shop 450-500 GSM tees, hoodies, and custom prints. Culture-first design made for everyday wear.";
export const BRAND_LOGO = `${SITE_URL}/brand-logo.png`;
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
export const DEFAULT_IMAGE_ALT = "Tees & Hoodies Hub premium apparel from Accra, Ghana";
export const OPEN_GRAPH_IMAGE_WIDTH = 1200;
export const OPEN_GRAPH_IMAGE_HEIGHT = 630;

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: BRAND_LOGO,
    image: DEFAULT_IMAGE,
    description: DEFAULT_DESCRIPTION,
    email: BRAND_EMAIL,
    foundingDate: "2023",
    sameAs: BRAND_SOCIAL_LINKS,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Accra",
      addressRegion: "Greater Accra",
      addressCountry: "GH",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: BRAND_EMAIL,
      contactType: "customer service",
      areaServed: "GH",
      availableLanguage: "en",
    },
  };
}

export function createWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function createLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": `${SITE_URL}/#local-business`,
    name: SITE_NAME,
    url: SITE_URL,
    image: DEFAULT_IMAGE,
    email: BRAND_EMAIL,
    priceRange: "GHS",
    sameAs: BRAND_SOCIAL_LINKS,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Accra",
      addressRegion: "Greater Accra",
      addressCountry: "GH",
    },
    areaServed: [
      { "@type": "Country", name: "Ghana" },
      { "@type": "Place", name: "West Africa" },
    ],
  };
}

export function createBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function createFaqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function createProductSchema(product: Product, images: string[]) {
  const productUrl = absoluteUrl(`/product/${product.id}`);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    sku: product.id,
    category: product.category,
    image: images.map((image) => absoluteUrl(image)),
    description: product.description,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    material: product.specs,
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: product.price,
      priceCurrency: "GHS",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };
}

export function createItemListSchema(products: Product[], path = "/shop") {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${absoluteUrl(path)}#item-list`,
    name: `${SITE_NAME} collection`,
    itemListElement: products.slice(0, 24).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/product/${product.id}`),
      name: product.name,
    })),
  };
}

export function createBlogPostingSchema(post: DbBlogPost) {
  const postUrl = absoluteUrl(`/blog/${post.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#blog-post`,
    headline: post.title,
    description: post.seo_description || post.excerpt,
    image: post.cover_image_url ? [absoluteUrl(post.cover_image_url)] : [DEFAULT_IMAGE],
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    author: {
      "@type": "Organization",
      name: post.author_name || SITE_NAME,
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: postUrl,
  };
}

export function createBlogItemListSchema(posts: DbBlogPost[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/blog#item-list`,
    name: `${SITE_NAME} blog`,
    itemListElement: posts.slice(0, 24).map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/blog/${post.slug}`),
      name: post.title,
    })),
  };
}
