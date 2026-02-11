import Link from "next/link";
import { redirect } from "next/navigation";
import { clearSessionCookie, requireAdminSession } from "@/lib/auth";

export default async function ProtectedAdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  async function logoutAction() {
    "use server";
    await clearSessionCookie();
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell">
      <nav className="admin-nav">
        <div>
          <strong>{session.email}</strong>
        </div>
        <div className="admin-links">
          <Link href="/admin/posts">Posts</Link>
          <Link href="/admin/posts/new">New Post</Link>
          <form action={logoutAction}>
            <button type="submit" className="text-button">
              Logout
            </button>
          </form>
        </div>
      </nav>
      {children}
    </div>
  );
}
