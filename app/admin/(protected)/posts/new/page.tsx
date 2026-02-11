import { redirect } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import AdminPostForm from "@/components/admin-post-form";
import { db } from "@/lib/db";
import { generateUniqueSlug } from "@/lib/slug";
import { isValidSpotifyPlaylistUrl } from "@/lib/spotify";

const createPostSchema = z.object({
  title: z.string().min(3).max(180),
  contentHtml: z.string().min(1),
  spotifyUrl: z.string().url(),
  isPublished: z.boolean()
});

export default async function NewPostPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  async function createPostAction(formData: FormData) {
    "use server";

    const payload = {
      title: String(formData.get("title") ?? ""),
      contentHtml: String(formData.get("contentHtml") ?? ""),
      spotifyUrl: String(formData.get("spotifyUrl") ?? ""),
      isPublished: formData.get("isPublished") === "on"
    };

    const parsed = createPostSchema.safeParse(payload);
    if (!parsed.success || !isValidSpotifyPlaylistUrl(parsed.data.spotifyUrl)) {
      redirect("/admin/posts/new?error=Invalid%20post%20data");
    }

    const cleanHtml = sanitizeHtml(parsed.data.contentHtml, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "img"]),
      allowedAttributes: {
        a: ["href", "name", "target", "rel"],
        img: ["src", "alt"],
        '*': ["class"]
      }
    });

    const slug = await generateUniqueSlug(parsed.data.title);

    await db.post.create({
      data: {
        title: parsed.data.title,
        slug,
        contentHtml: cleanHtml,
        spotifyUrl: parsed.data.spotifyUrl.trim(),
        isPublished: parsed.data.isPublished,
        publishedAt: parsed.data.isPublished ? new Date() : null
      }
    });

    redirect("/admin/posts");
  }

  return (
    <section className="admin-content">
      <h1>New Post</h1>
      {params.error ? <p className="error-banner">{params.error}</p> : null}
      <AdminPostForm action={createPostAction} submitLabel="Create post" />
    </section>
  );
}
