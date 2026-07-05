import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { getPublishedBlogPostBySlug } from "@/lib/supabaseApi";
import { createBlogPostingSchema, createBreadcrumbSchema } from "@/lib/seo";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
};

function formatPostDate(value: string | null) {
  if (!value) return "Latest";
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function renderContent(content: string) {
  const blocks = content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return blocks.map((block, index) => {
    if (block.startsWith("### ")) {
      return <h3 key={index} className="mt-12 font-serif text-2xl font-medium italic leading-snug text-foreground first:mt-0">{block.slice(4)}</h3>;
    }
    if (block.startsWith("## ")) {
      return <h2 key={index} className="mt-14 font-serif text-3xl font-medium italic leading-tight text-foreground first:mt-0 md:text-4xl">{block.slice(3)}</h2>;
    }
    if (block.startsWith("- ")) {
      return (
        <ul key={index} className="my-8 list-disc space-y-3 pl-6 text-base leading-8 text-muted-foreground">
          {block.split("\n").map((line) => (
            <li key={line}>{line.replace(/^- /, "")}</li>
          ))}
        </ul>
      );
    }
    if (/^\d+\.\s/.test(block)) {
      return (
        <ol key={index} className="my-8 list-decimal space-y-3 pl-6 text-base leading-8 text-muted-foreground">
          {block.split("\n").map((line) => (
            <li key={line}>{line.replace(/^\d+\.\s/, "")}</li>
          ))}
        </ol>
      );
    }
    return <p key={index} className="my-7 text-base leading-8 text-muted-foreground md:text-[17px] md:leading-9">{block}</p>;
  });
}

export default function BlogDetailPage() {
  const { slug = "" } = useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ["published-blog-post", slug],
    queryFn: () => getPublishedBlogPostBySlug(slug),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <main className="pb-20 pt-12">
        <div className="container max-w-4xl">
          <div className="h-[520px] animate-pulse bg-secondary" />
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="pb-20 pt-12">
        <SEOHead title="Article Not Found" canonical={`/blog/${slug}`} noIndex />
        <div className="container max-w-3xl text-center">
          <p className="font-serif text-2xl italic">Article not found</p>
          <Link to="/blog" className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-accent">
            <ArrowLeft className="h-4 w-4" /> Back to blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20 pt-12">
      <SEOHead
        title={post.seo_title || post.title}
        description={post.seo_description || post.excerpt}
        canonical={`/blog/${post.slug}`}
        ogImage={post.cover_image_url || undefined}
        ogImageAlt={post.cover_image_url ? `${post.title} cover image` : undefined}
        ogType="article"
        jsonLd={[
          createBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          createBlogPostingSchema(post),
        ]}
      />
      <article>
        <div className="container max-w-4xl">
          <Link to="/blog" className="mb-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to blog
          </Link>
          <motion.header {...fadeInUp}>
            <p className="technical-label mb-3">{formatPostDate(post.published_at)} / {post.author_name}</p>
            <h1 className="font-serif text-4xl font-medium italic leading-tight md:text-6xl">{post.title}</h1>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">{post.excerpt}</p>
          </motion.header>
        </div>

        {post.cover_image_url && (
          <motion.div {...fadeInUp} className="container mt-12">
            <div className="max-h-[680px] overflow-hidden bg-secondary">
              <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
            </div>
          </motion.div>
        )}

        <div className="container mt-14 max-w-3xl">
          <motion.div
            {...fadeInUp}
            className="max-w-none"
          >
            {renderContent(post.content)}
          </motion.div>
        </div>
      </article>
    </main>
  );
}
