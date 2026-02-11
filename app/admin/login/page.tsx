import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authenticateAdmin, createSessionToken, getSession, setSessionCookie } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect("/admin/posts");
  }

  const params = await searchParams;

  async function loginAction(formData: FormData) {
    "use server";

    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password")
    });

    if (!parsed.success) {
      redirect("/admin/login?error=Invalid%20credentials");
    }

    const user = await authenticateAdmin(parsed.data.email, parsed.data.password);
    if (!user) {
      redirect("/admin/login?error=Invalid%20credentials");
    }

    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      role: "ADMIN"
    });

    await setSessionCookie(token);
    redirect("/admin/posts");
  }

  return (
    <section className="admin-auth">
      <h1>Admin Login</h1>
      {params.error ? <p className="error-banner">{params.error}</p> : null}

      <form action={loginAction} className="admin-form">
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>

        <label>
          Password
          <input name="password" type="password" required minLength={8} autoComplete="current-password" />
        </label>

        <button type="submit">Log in</button>
      </form>

      <p className="muted">
        Back to <Link href="/">home</Link>
      </p>
    </section>
  );
}
