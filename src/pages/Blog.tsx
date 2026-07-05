import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { listPublishedBlogPosts } from "@/lib/supabaseApi";
import { createBlogItemListSchema, createBreadcrumbSchema } from "@/lib/seo";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
};

function formatPostDate(value: string | null) {
  if (!value) return "Latest";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function BlogPage() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["published-blog-posts"],
    queryFn: listPublishedBlogPosts,
  });

  return (
    <main className="pb-20 pt-12">
      <SEOHead
        title="Blog"
        description="Read Tees & Hoodies Hub stories, apparel guides, custom merch advice, and apparel care notes from Accra, Ghana."
        canonical="/blog"
        jsonLd={[
          createBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
          createBlogItemListSchema(posts),
        ]}
      />
      <div className="container">
        <motion.div {...fadeInUp} className="max-w-3xl">
          <p className="technical-label mb-3">Journal</p>
          <h1 className="font-serif text-4xl font-medium italic leading-tight md:text-6xl">Apparel Notes From Accra</h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Brand updates, custom merch guidance, fit notes, fabric care, and the thinking behind heavyweight everyday pieces.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-[360px] animate-pulse border border-border bg-secondary/50" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="mt-14 border border-dashed border-border p-10 text-center">
            <p className="font-serif text-xl italic">No published posts yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">Check back for guides, product stories, and custom merch notes.</p>
          </div>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: index * 0.04 }}
                className="group border border-border bg-background"
              >
                <Link to={`/blog/${post.slug}`} className="block h-full">
                  <div className="aspect-[4/3] overflow-hidden bg-secondary">
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-foreground text-background">
                        <span className="text-[10px] uppercase tracking-[0.22em]">Tees & Hoodies</span>
                      </div>
                    )}
                  </div>
                  <div className="flex min-h-[240px] flex-col p-7">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {formatPostDate(post.published_at)} / {post.author_name}
                    </p>
                    <h2 className="mt-5 font-serif text-2xl font-medium italic leading-snug">{post.title}</h2>
                    <p className="mt-5 line-clamp-4 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-8 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                      Read article <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
