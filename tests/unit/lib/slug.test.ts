import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUniqueMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  db: {
    post: {
      findUnique: findUniqueMock
    }
  }
}));

import { generateUniqueSlug, slugify } from "@/lib/slug";

describe("slug helpers", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
  });

  it("slugifies free-form text", () => {
    expect(slugify("  Hello, Music Blog!  ")).toBe("hello-music-blog");
    expect(slugify("A   B --- C")).toBe("a-b-c");
  });

  it("creates the base slug when unused", async () => {
    findUniqueMock.mockResolvedValue(null);
    await expect(generateUniqueSlug("My Post")).resolves.toBe("my-post");
  });

  it("increments suffix when collisions exist", async () => {
    findUniqueMock
      .mockResolvedValueOnce({ id: "p1" })
      .mockResolvedValueOnce({ id: "p2" })
      .mockResolvedValueOnce(null);

    await expect(generateUniqueSlug("My Post")).resolves.toBe("my-post-2");
  });

  it("keeps slug for the currently edited post", async () => {
    findUniqueMock.mockResolvedValue({ id: "same-post" });
    await expect(generateUniqueSlug("My Post", "same-post")).resolves.toBe("my-post");
  });
});
