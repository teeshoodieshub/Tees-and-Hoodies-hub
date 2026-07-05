import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const SITE_URL = "https://teesandhoodies.com";
const SITE_NAME = "Tees & Hoodies Hub";
const SITE_DESCRIPTION =
  "Premium heavyweight apparel from Accra, Ghana. Shop 450-500 GSM tees, hoodies, sleeveless tops, polos, and custom printed apparel.";
const TODAY = new Date().toISOString().slice(0, 10);

const staticPages = [
  {
    path: "/",
    changefreq: "weekly",
    priority: "1.0",
    title: "Premium apparel from Accra, Ghana",
    summary: "Brand homepage for heavyweight tees, hoodies, and custom apparel made from Accra.",
  },
  {
    path: "/shop",
    changefreq: "daily",
    priority: "0.9",
    title: "Shop collection",
    summary: "Browse ready-made heavyweight tees, hoodies, sleeveless tops, and other apparel pieces.",
  },
  {
    path: "/custom-prints",
    changefreq: "monthly",
    priority: "0.8",
    title: "Custom printing service",
    summary: "Order custom printed apparel for brands, teams, events, and merch drops.",
  },
  {
    path: "/custom-studio",
    changefreq: "monthly",
    priority: "0.7",
    title: "Custom print studio",
    summary: "Create apparel mockups, choose placement, upload artwork, and submit a custom order.",
  },
  {
    path: "/about",
    changefreq: "monthly",
    priority: "0.8",
    title: "About Tees & Hoodies Hub",
    summary: "Brand story, Accra roots, heavyweight fabric focus, and design point of view.",
  },
  {
    path: "/contact",
    changefreq: "monthly",
    priority: "0.8",
    title: "Contact",
    summary: "Customer contact details for email, Instagram, order support, and custom apparel questions.",
  },
  {
    path: "/blog",
    changefreq: "weekly",
    priority: "0.7",
    title: "Blog",
    summary: "Apparel guides, custom merch advice, product stories, and apparel care notes from Accra.",
  },
  {
    path: "/faq",
    changefreq: "monthly",
    priority: "0.6",
    title: "Frequently asked questions",
    summary: "Answers on tracking, exchanges, sizing, washing, and order changes.",
  },
  {
    path: "/shipping",
    changefreq: "monthly",
    priority: "0.5",
    title: "Shipping and delivery",
    summary: "Processing time, delivery windows, shipping costs, tracking, customs, and duties.",
  },
  {
    path: "/returns",
    changefreq: "monthly",
    priority: "0.5",
    title: "Return policy",
    summary: "Return and exchange eligibility, refund steps, damaged item support, and return shipping.",
  },
  {
    path: "/size-guide",
    changefreq: "monthly",
    priority: "0.5",
    title: "Size guide",
    summary: "Oversized fit notes, measurement guidance, and sizing support.",
  },
  {
    path: "/privacy",
    changefreq: "yearly",
    priority: "0.3",
    title: "Privacy policy",
    summary: "How customer information is collected, used, and protected.",
  },
  {
    path: "/terms",
    changefreq: "yearly",
    priority: "0.3",
    title: "Terms of service",
    summary: "Terms covering orders, payments, intellectual property, liability, and customer responsibilities.",
  },
];

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (process.env[key]) continue;
    process.env[key] = rest.join("=").replace(/^['"]|['"]$/g, "");
  }
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absolute(path) {
  return `${SITE_URL}${path}`;
}

function summarizeText(value, fallback) {
  const legacyTerm = new RegExp("street" + "wear", "gi");
  const text = String(value || fallback)
    .replace(legacyTerm, (match) => (match[0] === match[0].toUpperCase() ? "Apparel" : "apparel"))
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= 260) return text;
  return `${text.slice(0, 257).trim()}...`;
}

async function fetchProducts() {
  loadEnvFile(resolve(".env"));
  loadEnvFile(resolve(".env.local"));

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return [];

  try {
    const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/products?select=id,name,description,created_at&order=created_at.asc`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    if (!response.ok) return [];
    const products = await response.json();
    return Array.isArray(products) ? products : [];
  } catch {
    return [];
  }
}

async function fetchBlogPosts() {
  const staticPosts = readStaticBlogPosts();

  loadEnvFile(resolve(".env"));
  loadEnvFile(resolve(".env.local"));

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return staticPosts;

  try {
    const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/blog_posts?select=slug,title,excerpt,published_at,created_at&is_published=eq.true&order=published_at.desc.nullslast`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    if (!response.ok) return staticPosts;
    const posts = await response.json();
    return mergeBlogPosts(Array.isArray(posts) ? posts : [], staticPosts);
  } catch {
    return staticPosts;
  }
}

function readStaticBlogPosts() {
  try {
    const posts = JSON.parse(readFileSync(resolve("src/data/blogPosts.json"), "utf8"));
    if (!Array.isArray(posts)) return [];
    const now = new Date().toISOString();
    return posts
      .filter((post) => post?.is_published && (!post.published_at || post.published_at <= now))
      .sort(comparePostsByDate);
  } catch {
    return [];
  }
}

function mergeBlogPosts(remotePosts, staticPosts) {
  const bySlug = new Map();

  [...remotePosts, ...staticPosts].forEach((post) => {
    if (post?.slug && !bySlug.has(post.slug)) {
      bySlug.set(post.slug, post);
    }
  });

  return Array.from(bySlug.values()).sort(comparePostsByDate);
}

function comparePostsByDate(a, b) {
  const bDate = b.published_at || b.created_at || "";
  const aDate = a.published_at || a.created_at || "";
  return bDate.localeCompare(aDate);
}

function buildSitemap(products, posts) {
  const staticUrls = staticPages
    .map(
      (page) => `  <url>
    <loc>${escapeXml(absolute(page.path))}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("\n");

  const productUrls = products
    .map(
      (product) => `  <url>
    <loc>${escapeXml(absolute(`/product/${encodeURIComponent(product.id)}`))}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("\n");

  const blogUrls = posts
    .map(
      (post) => `  <url>
    <loc>${escapeXml(absolute(`/blog/${encodeURIComponent(post.slug)}`))}</loc>
    <lastmod>${escapeXml((post.published_at || post.created_at || TODAY).slice(0, 10))}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[staticUrls, productUrls, blogUrls].filter(Boolean).join("\n")}
</urlset>
`;
}

function buildLlmsTxt(products, posts) {
  const pageLinks = staticPages
    .filter((page) => page.priority !== "0.3")
    .map((page) => `- [${page.title}](${absolute(page.path)}): ${page.summary}`)
    .join("\n");
  const productLinks = products
    .slice(0, 30)
    .map((product) => `- [${product.name}](${absolute(`/product/${encodeURIComponent(product.id)}`)}): ${summarizeText(product.description, "Product page for Tees & Hoodies Hub apparel.")}`)
    .join("\n");
  const blogLinks = posts
    .slice(0, 30)
    .map((post) => `- [${post.title}](${absolute(`/blog/${encodeURIComponent(post.slug)}`)}): ${summarizeText(post.excerpt, "Blog post from Tees & Hoodies Hub.")}`)
    .join("\n");

  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME} is an Accra, Ghana apparel and custom apparel brand focused on heavyweight essentials, clean silhouettes, and custom print production for brands, events, teams, and merch drops.

## Core pages

${pageLinks}

## Product pages

${productLinks || "- Product URLs are generated from the live product catalogue when available during build."}

## Blog posts

${blogLinks || "- Published blog posts are included here when available during build."}

## Citation notes

- Primary location: Accra, Ghana.
- Core products: heavyweight tees, hoodies, sleeveless tops, polos, and custom printed apparel.
- Fabric positioning: premium heavyweight garments, including 450-500 GSM cotton options.
- Customer support: hello@teesandhoodies.com.
- Canonical website: ${SITE_URL}.

## Full context

- [Full AI-readable site summary](${SITE_URL}/llms-full.txt)
`;
}

function buildLlmsFullTxt(products, posts) {
  const pageSections = staticPages
    .map((page) => `### ${page.title}
URL: ${absolute(page.path)}
Summary: ${page.summary}`)
    .join("\n\n");
  const productSections = products
    .slice(0, 50)
    .map((product) => `### ${product.name}
URL: ${absolute(`/product/${encodeURIComponent(product.id)}`)}
Summary: ${summarizeText(product.description, "Product page for Tees & Hoodies Hub apparel.")}`)
    .join("\n\n");
  const blogSections = posts
    .slice(0, 50)
    .map((post) => `### ${post.title}
URL: ${absolute(`/blog/${encodeURIComponent(post.slug)}`)}
Summary: ${summarizeText(post.excerpt, "Blog post from Tees & Hoodies Hub.")}`)
    .join("\n\n");

  return `# ${SITE_NAME} full site context

${SITE_DESCRIPTION}

## Brand facts

- Brand name: ${SITE_NAME}
- Website: ${SITE_URL}
- Based in: Accra, Ghana
- Founded: 2023
- Focus: premium heavyweight apparel, blank merch, and custom printed apparel
- Apparel categories: tees, hoodies, sleeveless tops, polo shirts, and custom print orders
- Fabric positioning: 450-500 GSM heavyweight cotton options
- Support email: hello@teesandhoodies.com
- Instagram: https://instagram.com/teesandhoodies

## Frequently cited answers

### Where can I buy heavyweight hoodies and tees in Accra?
Tees & Hoodies Hub sells heavyweight tees, hoodies, sleeveless tops, polos, and custom printed apparel from Accra, Ghana through ${SITE_URL}.

### Does Tees & Hoodies Hub make custom merch for brands and events?
Yes. Customers can order custom printed tees, hoodies, polos, and sleeveless tops for brands, teams, events, and merch drops, with mockup support before production.

### What fabric weight does Tees & Hoodies Hub use?
The brand focuses on premium heavyweight garments, including 450-500 GSM cotton options for structured apparel pieces.

## Site pages

${pageSections}

## Product catalogue

${productSections || "Product details are managed in the live catalogue and included in this file when Supabase product data is available during build."}

## Blog posts

${blogSections || "Published blog posts are included here when available during build."}
`;
}

const products = await fetchProducts();
const posts = await fetchBlogPosts();
writeFileSync(resolve("public/sitemap.xml"), buildSitemap(products, posts));
writeFileSync(resolve("public/llms.txt"), buildLlmsTxt(products, posts));
writeFileSync(resolve("public/llms-full.txt"), buildLlmsFullTxt(products, posts));
console.log(`SEO files generated with ${products.length} product URL(s) and ${posts.length} blog URL(s).`);
