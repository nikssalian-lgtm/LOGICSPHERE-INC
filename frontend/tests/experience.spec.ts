import { test, expect } from "@playwright/test";

test("appearance persists and the scroll sequence advances", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".hero-sculpture canvas")).toBeVisible();
  const canvas = page.locator(".hero-sculpture canvas");
  const initial = await canvas.evaluate((node: HTMLCanvasElement) =>
    node.toDataURL(),
  );
  await expect
    .poll(() => canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL()))
    .not.toBe(initial);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Switch to light theme" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await page.getByRole("button", { name: "Pause animations" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  await page.waitForTimeout(100);
  const paused = await canvas.evaluate((node: HTMLCanvasElement) =>
    node.toDataURL(),
  );
  await page.waitForTimeout(150);
  expect(
    await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL()),
  ).toBe(paused);
  const scene = page.locator(".scroll-experience");
  for (const [progress, title] of [
    [0.12, "Complexity. Reimagined."],
    [0.5, "Every part. Connected."],
    [0.9, "Ideas. Made tangible."],
  ] as const) {
    await scene.evaluate(
      (element, p) =>
        window.scrollTo(
          0,
          element.getBoundingClientRect().top +
            window.scrollY +
            (element.clientHeight - innerHeight) * p,
        ),
      progress,
    );
    await expect(
      page.locator(".experience-copy article.is-active h2"),
    ).toHaveText(title);
    const box = await page.locator(".experience-stage").boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(70);
    expect(box!.y).toBeLessThan(90);
  }
  await page.screenshot({ path: "../.local/experience-scroll-light.png" });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "../.local/experience-desktop-light.png" });
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await page.screenshot({ path: "../.local/experience-desktop-dark.png" });
  expect(errors).toEqual([]);
});

test("mobile themes, menu and reduced motion remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.screenshot({ path: "../.local/experience-mobile-light.png" });
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await page.screenshot({ path: "../.local/experience-mobile-dark.png" });
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(
    page.locator(".experience-copy article[aria-hidden='false']"),
  ).toHaveCount(3);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: /Services/ })
    .click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "../.local/experience-services-mobile.png" });
});

test("light graphics stay legible and default survives unavailable storage", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("Storage disabled");
    };
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  for (const [selector, name] of [
    [".home-services", "services"],
    [".software-showcase", "dashboard"],
    [".channel-showcase", "channels"],
    [".journey-visual", "network"],
  ]) {
    const section = page.locator(selector);
    await section.scrollIntoViewIfNeeded();
    await section.screenshot({ path: `../.local/light-review-${name}.png` });
  }
  // Text previously used near-white paint on light panels; verify rendered colors against their surfaces.
  for (const selector of [
    ".dashboard-side .selected",
    ".commerce-hero b",
    ".journey-hub",
  ]) {
    const ratio = await page.locator(selector).evaluate((element) => {
      const rgb = (value: string) =>
        (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const luminance = (channels: number[]) =>
        channels
          .map((v) => v / 255)
          .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
          .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      const foreground = luminance(rgb(getComputedStyle(element).color));
      // Conservative reference surfaces: white for light labels, brightest hub gradient stop for white lettering.
      const background = luminance(
        element.classList.contains("journey-hub")
          ? [0, 111, 151]
          : [204, 233, 243],
      );
      return (
        (Math.max(foreground, background) + 0.05) /
        (Math.min(foreground, background) + 0.05)
      );
    });
    expect(ratio, selector).toBeGreaterThan(4.5);
  }
});
