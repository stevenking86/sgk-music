import Link from "next/link";
import { db, isDatabaseConfigured } from "@/lib/db";

export default async function AdminPostsPage() {
  const posts = isDatabaseConfigured
    ? await db.post.findMany({
        orderBy: [{ createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          slug: true,
          isPublished: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true
        }
      })
    : [];

  return (
    <section className="admin-content">
      <div className="admin-header-row">
        <h1>Posts</h1>
        <Link href="/admin/posts/new" className="button-link">
          Create post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="muted">No posts yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Published</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td>{post.isPublished ? "Published" : "Draft"}</td>
                <td>{post.publishedAt ? post.publishedAt.toLocaleDateString() : "-"}</td>
                <td>{post.updatedAt.toLocaleDateString()}</td>
                <td>
                  <Link href={`/admin/posts/${post.id}`}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
