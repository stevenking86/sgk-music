import bcrypt from "bcryptjs";
import { expect, test, type Page } from "@playwright/test";
import { PrismaClient, UserRole } from "@prisma/client";

const E2E_ADMIN_EMAIL = "e2e-admin@example.com";
const E2E_ADMIN_PASSWORD = "E2E-Password-123";
const E2E_TITLE_PREFIX = "[E2E]";
const PLAYLIST_URL = "https://open.spotify.com/playlist/37i9dQZF1DX4JAvHpjipBk";
const PLAYLIST_ID = "37i9dQZF1DX4JAvHpjipBk";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const prisma = hasDatabaseUrl ? new PrismaClient() : null;

test.describe("admin CMS flows", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(!hasDatabaseUrl, "DATABASE_URL is required for admin E2E flows.");

  test.beforeAll(async () => {
    if (!prisma) {
      return;
    }

    const passwordHash = await bcrypt.hash(E2E_ADMIN_PASSWORD, 12);
    await prisma.user.upsert({
      where: { email: E2E_ADMIN_EMAIL },
      update: { passwordHash, role: UserRole.ADMIN },
      create: { email: E2E_ADMIN_EMAIL, passwordHash, role: UserRole.ADMIN }
    });
  });

  test.afterEach(async () => {
    if (!prisma) {
      return;
    }

    await prisma.post.deleteMany({
      where: {
        title: {
          startsWith: E2E_TITLE_PREFIX
        }
      }
    });
  });

  test.afterAll(async () => {
    if (!prisma) {
      return;
    }

    await prisma.$disconnect();
  });

  test("redirects unauthenticated users from protected admin pages", async ({ page }) => {
    await page.goto("/admin/posts");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole("heading", { name: "Admin Login" })).toBeVisible();
  });

  test("shows an error for invalid login", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(E2E_ADMIN_EMAIL);
    await page.getByLabel("Password").fill("incorrect-password");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page).toHaveURL(/\/admin\/login\?error=/);
    await expect(page.getByText("Invalid credentials")).toBeVisible();
  });

  test("creates a draft post that stays hidden from the public feed", async ({ page }) => {
    const title = `${E2E_TITLE_PREFIX} Draft ${Date.now()}`;
    await login(page);
    await createPost(page, { title, isPublished: false });

    const row = page.locator("tr", { hasText: title });
    await expect(row).toBeVisible();
    await expect(row.getByRole("cell", { name: "Draft", exact: true })).toBeVisible();

    await page.goto("/");
    await expect(page.getByRole("link", { name: title })).not.toBeVisible();
  });

  test("publishes an edited post and logs out cleanly", async ({ page }) => {
    const draftTitle = `${E2E_TITLE_PREFIX} Draft-to-Publish ${Date.now()}`;
    const publishedTitle = `${draftTitle} Published`;

    await login(page);
    await createPost(page, { title: draftTitle, isPublished: false });

    const row = page.locator("tr", { hasText: draftTitle });
    await expect(row).toBeVisible();
    await row.getByRole("link", { name: "Edit" }).click();

    await expect(page.getByRole("heading", { name: "Edit Post" })).toBeVisible();
    await page.getByLabel("Title").fill(publishedTitle);
    await page.getByLabel("Publish now").check();

    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL(/\/admin\/posts$/);

    const updatedRow = page.locator("tr", { hasText: publishedTitle });
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow.getByRole("cell", { name: "Published", exact: true })).toBeVisible();

    await page.goto("/");
    const postLink = page.getByRole("link", { name: publishedTitle }).first();
    await expect(postLink).toBeVisible();
    await postLink.click();

    await expect(page).toHaveURL(/\/posts\//);
    await expect(page.getByRole("heading", { name: publishedTitle })).toBeVisible();
    await expect(page.getByTitle("Spotify Playlist")).toHaveAttribute("src", new RegExp(`${PLAYLIST_ID}`));

    await page.goto("/admin/posts");
    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);

    await page.goto("/admin/posts");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(E2E_ADMIN_EMAIL);
  await page.getByLabel("Password").fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/admin\/posts$/);
}

async function createPost(page: Page, options: { title: string; isPublished: boolean }) {
  await page.goto("/admin/posts/new");
  await expect(page.getByRole("heading", { name: "New Post" })).toBeVisible();

  await page.getByLabel("Title").fill(options.title);
  await page.getByLabel("Spotify Playlist URL").fill(PLAYLIST_URL);

  const editor = page.locator(".tiptap").first();
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type(`Playwright content for ${options.title}`);

  const publishCheckbox = page.getByLabel("Publish now");
  if (options.isPublished) {
    await publishCheckbox.check();
  } else {
    await publishCheckbox.uncheck();
  }

  await page.getByRole("button", { name: "Create post" }).click();
  await expect(page).toHaveURL(/\/admin\/posts$/);
}
