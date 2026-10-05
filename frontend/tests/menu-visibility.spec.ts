import { test, expect } from "@playwright/test";

test("menu visibility can be hidden and restored without deleting a link", async ({
  page,
}) => {
  let status = "published";
  const changes: boolean[] = [];
  await page.route("**/api/v1/auth/user", (route) =>
    route.fulfill({
      json: {
        data: {
          id: 1,
          name: "Navigation test",
          email: "navigation@example.test",
          permissions: ["*"],
          active: true,
        },
      },
    }),
  );
  await page.route("**/sanctum/csrf-cookie", (route) =>
    route.fulfill({ status: 204 }),
  );
  await page.route("**/api/v1/admin/content/menus**", async (route) => {
    if (route.request().url().endsWith("/publication")) {
      const publish = route.request().postDataJSON().publish;
      changes.push(publish);
      status = publish ? "published" : "draft";
      await route.fulfill({ json: { data: {} } });
      return;
    }
    await route.fulfill({
      json: {
        data: [
          {
            id: 42,
            title: "Services",
            slug: "primary-services",
            status,
            updated_at: "2026-10-05T12:00:00Z",
            attributes: { menu: "primary", url: "/services" },
            media: [],
          },
        ],
        meta: { current_page: 1, last_page: 1, total: 1 },
        module: {
          key: "menus",
          label: "Navigation",
          item: "Menu link",
          fields: {},
          has_summary: false,
          has_body: false,
        },
      },
    });
  });
  await page.goto("/admin/menus");
  const row = page.getByRole("row").filter({
    has: page.getByRole("button", { name: "Edit Services", exact: true }),
  });
  await expect(row).toContainText("Published");
  await page
    .getByRole("button", { name: "Hide Services", exact: true })
    .click();
  await expect(row).toContainText("Hidden");
  await expect(
    page.getByText("Menu link hidden from the website."),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Publish Services", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Publish Services", exact: true })
    .click();
  await expect(row).toContainText("Published");
  expect(changes).toEqual([false, true]);
});
