import Link from "next/link";
import { db, isDatabaseConfigured } from "@/lib/db";
import { toPreviewText } from "@/lib/post-preview";

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 5;
type PostListItem = {
  id: string;
  title: string;
  slug: string;
  contentHtml: string;
  publishedAt: Date | null;
  createdAt: Date;
};

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number.parseInt(params.page ?? "1", 10);
  const currentPage = Number.isNaN(page) || page < 1 ? 1 : page;

  const [posts, totalCount]: [PostListItem[], number] = isDatabaseConfigured
    ? await Promise.all([
        db.post.findMany({
          where: { isPublished: true },
          orderBy: { publishedAt: "desc" },
          skip: (currentPage - 1) * POSTS_PER_PAGE,
          take: POSTS_PER_PAGE,
          select: {
            id: true,
            title: true,
            slug: true,
            contentHtml: true,
            publishedAt: true,
            createdAt: true
          }
        }),
        db.post.count({ where: { isPublished: true } })
      ])
    : [[], 0];

  const totalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));

  return (
    <section className="post-feed">
      {posts.length === 0 ? (
        <p className="muted">No published posts yet.</p>
      ) : (
        posts.map((post) => (
          <article key={post.id} className="post-card">
            <p className="post-date">
              {(post.publishedAt ?? post.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric"
              })}
            </p>
            <h2>
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="post-preview">{toPreviewText(post.contentHtml)}</p>
            <Link href={`/posts/${post.slug}`} className="read-more">
              Read post
            </Link>
          </article>
        ))
      )}

      <nav className="pager" aria-label="Pagination">
        {currentPage > 1 ? <Link href={`/?page=${currentPage - 1}`}>Newer posts</Link> : <span />}
        {currentPage < totalPages ? <Link href={`/?page=${currentPage + 1}`}>Older posts</Link> : <span />}
      </nav>
    </section>
  );
}
