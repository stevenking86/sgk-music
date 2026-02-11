import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { db, isDatabaseConfigured } from "@/lib/db";
import { toSpotifyEmbedUrl } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isDatabaseConfigured) {
    notFound();
  }

  const post = await db.post.findUnique({
    where: { slug },
    select: {
      title: true,
      contentHtml: true,
      spotifyUrl: true,
      isPublished: true,
      publishedAt: true,
      createdAt: true
    }
  });

  if (!post || !post.isPublished) {
    notFound();
  }

  const safeHtml = sanitizeHtml(post.contentHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "img"]),
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt"],
      '*': ["class"]
    }
  });

  const embedUrl = toSpotifyEmbedUrl(post.spotifyUrl);

  return (
    <article className="single-post">
      <p className="post-date">
        {(post.publishedAt ?? post.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        })}
      </p>
      <h1>{post.title}</h1>

      <div className="post-content" dangerouslySetInnerHTML={{ __html: safeHtml }} />

      {embedUrl ? (
        <section className="playlist-block">
          <h2>Playlist</h2>
          <iframe
            title="Spotify Playlist"
            src={embedUrl}
            width="100%"
            height="352"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </section>
      ) : null}
    </article>
  );
}
