import { db } from "@/lib/db";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateUniqueSlug(title: string, existingPostId?: string): Promise<string> {
  const base = slugify(title) || "post";

  for (let i = 0; i < 2000; i += 1) {
    const candidate = i === 0 ? base : `${base}-${i}`;
    const existing = await db.post.findUnique({
      where: { slug: candidate },
      select: { id: true }
    });

    if (!existing || existing.id === existingPostId) {
      return candidate;
    }
  }

  throw new Error("Unable to generate unique slug for post title.");
}
