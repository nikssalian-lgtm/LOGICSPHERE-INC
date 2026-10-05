import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const { password } = JSON.parse(readFileSync("../.local/e2e.json", "utf8")) as {
  password: string;
};

test("public homepage and phase 3 navigation render", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Digital systems",
  );
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Services", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Complexity",
  );
  await page.getByRole("link", { name: "Start a project" }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Every good thing",
  );
  await expect(page.getByLabel("Work email")).toBeVisible();
});

test("public motion keeps the hero visible and reveals content on scroll", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".home-hero")).toHaveCSS("opacity", "1");

  const introduction = page.locator(".intro-band");
  await introduction.scrollIntoViewIfNeeded();
  await expect(introduction).toHaveClass(/is-visible/);
  await expect(
    introduction.getByText(/From a complex operational challenge/),
  ).toBeVisible();
});

test("unapproved preview work stays out of the public portfolio", async ({
  page,
}) => {
  await page.goto("/portfolio", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", {
      name: /The right work starts with your challenge/,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Start a conversation" }),
  ).toHaveAttribute("href", "/contact");
  await expect(page.locator("body")).not.toContainText(
    /placeholder|manage portfolio|admin workspace/i,
  );
});

test("public pages emit crawl metadata and organization structured data", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /.+/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /.+/,
  );
  const organization = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  expect(JSON.parse(organization ?? "{}")).toMatchObject({
    "@type": "Organization",
    name: "LogicSphere Inc",
  });
  const robots = await page.request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("User-Agent: *");
});

test("admin requires login, persists sessions and logout revokes access", async ({
  page,
  context,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email address").fill("admin@example.test");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await expect(
    page.getByRole("heading", { name: /Welcome, Test/ }),
  ).toBeVisible();
  await expect(page.getByText("Connected", { exact: true })).toBeVisible();
  const cookies = await context.cookies();
  expect(
    cookies.find((c) => c.name === "logicsphere_e2e_session")?.httpOnly,
  ).toBe(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Welcome, Test/ }),
  ).toBeVisible();
  await expect(page.getByText("Connected", { exact: true })).toBeVisible();
  await page.screenshot({ path: "../docs/admin-desktop.png", fullPage: true });
  await page.getByRole("link", { name: "Services", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Services",
  );
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login$/);
});

test("invalid login displays a helpful error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill("unknown@example.test");
  await page.getByLabel("Password", { exact: true }).fill("Wrong!Password2026");
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "credentials",
  );
});

test("member cannot access admin UI or API", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill("member@example.test");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Access restricted" }),
  ).toBeVisible();
  const status = await page.evaluate(
    async () =>
      (
        await fetch("/api/v1/admin/overview", {
          headers: { Accept: "application/json" },
        })
      ).status,
  );
  expect(status).toBe(403);
});

test("missing CSRF token is rejected", async ({ request }) => {
  const response = await request.post("/api/v1/auth/login", {
    data: { email: "admin@example.test", password },
    headers: { Accept: "application/json" },
  });
  expect(response.status()).toBe(419);
});

test("password reset request shows a neutral confirmation", async ({
  page,
}) => {
  await page.goto("/forgot-password");
  await page.getByLabel("Email address").fill("missing@example.test");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("status")).toContainText("If an account matches");
  await page.goto("/reset-password");
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "incomplete",
  );
});

test("mobile marketing layout, navigation and reduced motion", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  for (const width of [2560, 1440, 1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `homepage should not overflow at ${width}px`,
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "../docs/marketing-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: /Services/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Complexity",
  );
  await page.goto("/login");
  await page.getByLabel("Email address").fill("admin@example.test");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await expect(
    page.getByRole("heading", { name: /Welcome, Test/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Services", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Services",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("unknown route renders a useful 404", async ({ page }) => {
  const response = await page.goto("/unknown-page");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This page isn’t here." }),
  ).toBeVisible();
});
