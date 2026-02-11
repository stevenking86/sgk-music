import { notFound, redirect } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import AdminPostForm from "@/components/admin-post-form";
import { db } from "@/lib/db";
import { generateUniqueSlug } from "@/lib/slug";
import { isValidSpotifyPlaylistUrl } from "@/lib/spotify";

const updatePostSchema = z.object({
  title: z.string().min(3).max(180),
  contentHtml: z.string().min(1),
  spotifyUrl: z.string().url(),
  isPublished: z.boolean()
});

export default async function EditPostPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;

  const post = await db.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      contentHtml: true,
      spotifyUrl: true,
      isPublished: true,
      publishedAt: true
    }
  });

  if (!post) {
    notFound();
  }

  async function updatePostAction(formData: FormData) {
    "use server";

    const existingPost = await db.post.findUnique({
      where: { id },
      select: { id: true, publishedAt: true }
    });

    if (!existingPost) {
      redirect("/admin/posts");
    }

    const payload = {
      title: String(formData.get("title") ?? ""),
      contentHtml: String(formData.get("contentHtml") ?? ""),
      spotifyUrl: String(formData.get("spotifyUrl") ?? ""),
      isPublished: formData.get("isPublished") === "on"
    };

    const parsed = updatePostSchema.safeParse(payload);
    if (!parsed.success || !isValidSpotifyPlaylistUrl(parsed.data.spotifyUrl)) {
      redirect(`/admin/posts/${id}?error=Invalid%20post%20data`);
    }

    const cleanHtml = sanitizeHtml(parsed.data.contentHtml, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "img"]),
      allowedAttributes: {
        a: ["href", "name", "target", "rel"],
        img: ["src", "alt"],
        "*": ["class"]
      }
    });

    const slug = await generateUniqueSlug(parsed.data.title, id);

    const shouldSetPublishedAt = parsed.data.isPublished && !existingPost.publishedAt;

    await db.post.update({
      where: { id },
      data: {
        title: parsed.data.title,
        slug,
        contentHtml: cleanHtml,
        spotifyUrl: parsed.data.spotifyUrl.trim(),
        isPublished: parsed.data.isPublished,
        publishedAt: shouldSetPublishedAt ? new Date() : existingPost.publishedAt
      }
    });

    redirect("/admin/posts");
  }

  return (
    <section className="admin-content">
      <h1>Edit Post</h1>
      {query.error ? <p className="error-banner">{query.error}</p> : null}
      <AdminPostForm
        action={updatePostAction}
        submitLabel="Save changes"
        initialValues={{
          title: post.title,
          contentHtml: post.contentHtml,
          spotifyUrl: post.spotifyUrl,
          isPublished: post.isPublished
        }}
      />
    </section>
  );
}
