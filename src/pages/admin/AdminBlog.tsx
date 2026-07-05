import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ImagePlus, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  createBlogPost,
  deleteBlogPost,
  listBlogPostsAdmin,
  updateBlogPost,
  uploadProductImage,
  type BlogPostInput,
  type DbBlogPost,
} from "@/lib/supabaseApi";

type BlogForm = BlogPostInput;

const emptyForm: BlogForm = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  author_name: "Tees & Hoodies Hub",
  is_published: false,
  published_at: "",
  seo_title: "",
  seo_description: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDateTimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function mapPostToForm(post: DbBlogPost): BlogForm {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    cover_image_url: post.cover_image_url || "",
    author_name: post.author_name,
    is_published: post.is_published,
    published_at: toDateTimeLocal(post.published_at),
    seo_title: post.seo_title || "",
    seo_description: post.seo_description || "",
  };
}

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminBlog() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BlogForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: listBlogPostsAdmin,
  });

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsAdding(false);
  };

  const invalidateBlogQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    queryClient.invalidateQueries({ queryKey: ["published-blog-posts"] });
  };

  const createMutation = useMutation({
    mutationFn: createBlogPost,
    onSuccess: () => {
      invalidateBlogQueries();
      resetForm();
      toast.success("Blog post created");
    },
    onError: (error: Error) => toast.error(`Create failed: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, post }: { id: string; post: BlogPostInput }) => updateBlogPost(id, post),
    onSuccess: () => {
      invalidateBlogQueries();
      resetForm();
      toast.success("Blog post updated");
    },
    onError: (error: Error) => toast.error(`Update failed: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      invalidateBlogQueries();
      toast.success("Blog post deleted");
    },
    onError: (error: Error) => toast.error(`Delete failed: ${error.message}`),
  });

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: isEditing || prev.slug ? prev.slug : slugify(title),
      seo_title: prev.seo_title || title,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const slug = slugify(form.slug || form.title);

    if (!slug || !form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      toast.error("Title, slug, excerpt, and content are required");
      return;
    }

    const payload: BlogPostInput = {
      ...form,
      slug,
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      cover_image_url: form.cover_image_url || null,
      author_name: form.author_name.trim() || "Tees & Hoodies Hub",
      published_at: fromDateTimeLocal(form.published_at),
      seo_title: form.seo_title?.trim() || null,
      seo_description: form.seo_description?.trim() || form.excerpt.trim(),
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, post: payload });
      return;
    }
    createMutation.mutate(payload);
  };

  const handleEdit = (post: DbBlogPost) => {
    setForm(mapPostToForm(post));
    setEditingId(post.id);
    setIsAdding(true);
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      const url = await uploadProductImage(file);
      setForm((prev) => ({ ...prev, cover_image_url: url }));
      toast.success("Cover image uploaded");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not upload cover image.";
      toast.error(message);
    } finally {
      setIsUploadingCover(false);
      event.target.value = "";
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Blog Management</h2>
          <p className="mt-1 text-xs text-muted-foreground">Create SEO-friendly articles, guides, and brand updates.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 bg-foreground px-4 py-2 text-xs uppercase tracking-[0.12em] text-background transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Post
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 border border-border bg-background/50 p-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                className="mt-2 h-11 w-full border border-border bg-transparent px-3 text-sm outline-none transition-colors focus:border-foreground"
                placeholder="How to choose heavyweight hoodies in Ghana"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Slug</span>
              <input
                type="text"
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: slugify(event.target.value) }))}
                className="mt-2 h-11 w-full border border-border bg-transparent px-3 font-mono text-sm outline-none transition-colors focus:border-foreground"
                placeholder="how-to-choose-heavyweight-hoodies"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Excerpt</span>
              <textarea
                value={form.excerpt}
                onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
                className="mt-2 min-h-[92px] w-full resize-none border border-border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-foreground"
                placeholder="Short summary for blog cards, search results, and AI snippets."
                maxLength={320}
              />
              <span className="mt-1 block text-right text-[10px] text-muted-foreground">{form.excerpt.length}/320</span>
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Content</span>
              <textarea
                value={form.content}
                onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                className="mt-2 min-h-[360px] w-full resize-y border border-border bg-transparent px-3 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-foreground"
                placeholder={"Use paragraphs, ## headings, ### subheadings, - bullets, and numbered lists.\n\nExample:\n## Choosing the right fabric\nHeavyweight cotton gives structure..."}
              />
            </label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">SEO Title</span>
                <input
                  type="text"
                  value={form.seo_title || ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, seo_title: event.target.value }))}
                  className="mt-2 h-11 w-full border border-border bg-transparent px-3 text-sm outline-none transition-colors focus:border-foreground"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Author</span>
                <input
                  type="text"
                  value={form.author_name}
                  onChange={(event) => setForm((prev) => ({ ...prev, author_name: event.target.value }))}
                  className="mt-2 h-11 w-full border border-border bg-transparent px-3 text-sm outline-none transition-colors focus:border-foreground"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">SEO Description</span>
              <textarea
                value={form.seo_description || ""}
                onChange={(event) => setForm((prev) => ({ ...prev, seo_description: event.target.value }))}
                className="mt-2 min-h-[82px] w-full resize-none border border-border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-foreground"
                maxLength={180}
              />
              <span className="mt-1 block text-right text-[10px] text-muted-foreground">{(form.seo_description || "").length}/180</span>
            </label>
          </div>

          <aside className="space-y-6">
            <div className="border border-border p-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Cover Image</span>
              {form.cover_image_url ? (
                <div className="group relative mt-3 aspect-[4/3] overflow-hidden bg-secondary">
                  <img src={form.cover_image_url} alt="Cover preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, cover_image_url: "" }))}
                    className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center bg-background/90 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="mt-3 flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
                  {isUploadingCover ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                  <span className="text-[10px] uppercase tracking-[0.16em]">{isUploadingCover ? "Uploading" : "Upload Cover"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={isUploadingCover} />
                </label>
              )}
            </div>

            <div className="space-y-4 border border-border p-4">
              <label className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(event) => setForm((prev) => ({ ...prev, is_published: event.target.checked }))}
                />
                Published
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Publish Date</span>
                <input
                  type="datetime-local"
                  value={form.published_at || ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, published_at: event.target.value }))}
                  className="mt-2 h-11 w-full border border-border bg-transparent px-3 text-sm outline-none transition-colors focus:border-foreground"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-11 items-center gap-2 bg-foreground px-5 text-xs uppercase tracking-[0.15em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {isEditing ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="h-11 border border-border px-5 text-xs uppercase tracking-[0.15em] transition-colors hover:border-foreground"
              >
                Cancel
              </button>
            </div>
          </aside>
        </form>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Posts</h3>
          <span className="text-xs text-muted-foreground">{posts.length} total</span>
        </div>
        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No blog posts yet.</div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="flex gap-4 border border-border p-4">
              <div className="h-20 w-24 shrink-0 overflow-hidden bg-secondary">
                {post.cover_image_url && <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${post.is_published ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground"}`}>
                    {post.is_published ? "Published" : "Draft"}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{formatDate(post.published_at)}</span>
                </div>
                <h4 className="truncate font-serif text-lg font-medium italic">{post.title}</h4>
                <p className="mt-1 font-mono text-xs text-muted-foreground">/blog/{post.slug}</p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{post.excerpt}</p>
              </div>
              <div className="flex shrink-0 items-start gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(post)}
                  className="inline-flex h-9 w-9 items-center justify-center border border-border transition-colors hover:border-foreground"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete "${post.title}"?`)) {
                      deleteMutation.mutate(post.id);
                    }
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center border border-border text-red-500 transition-colors hover:border-red-500"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
