import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Enter interactive demo" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});

test("demo user can publish a job and use the safe AI fallback", async ({
  page,
}) => {
  await page.goto("/work");
  await page.getByRole("button", { name: "Employer view" }).click();
  await page.getByRole("button", { name: "Post a job" }).click();

  await page
    .getByLabel("Describe the job naturally")
    .fill("Need six dining helpers tomorrow in Madhapur for 900 rupees.");
  const listingAssistant = page.locator("section").filter({
    has: page.getByText("Describe the job naturally", { exact: true }),
  });
  await listingAssistant
    .getByRole("button", { name: "Assist with GPT-5.6" })
    .click();
  await expect(page.getByText(/Safe fallback|Live GPT-5.6/)).toBeVisible();

  await page.getByLabel("Job title").fill("Community event dining helpers");
  await page.getByLabel("Area").fill("Madhapur");
  await page
    .getByLabel("Skills, separated by commas")
    .fill("Event service, Guest support");
  await page
    .getByLabel("Description")
    .fill("Help serve guests and close the dining area safely.");
  await page.getByRole("button", { name: "Publish job" }).click();
  await expect(
    page.getByRole("heading", { name: "Community event dining helpers" }),
  ).toBeVisible();
});

test("produce and books journeys expose transparent seeded workflows", async ({
  page,
}) => {
  await page.goto("/produce");
  await expect(
    page.getByRole("heading", {
      name: "Compare the whole offer—not only one number.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Compare buyer offers").first()).toBeVisible();
  await page.getByRole("button", { name: "Buyer view" }).click();
  await expect(page.getByText(/Paddy|Maize/).first()).toBeVisible();

  await page.goto("/books");
  await expect(
    page.getByRole("heading", {
      name: "Every useful book deserves another reader.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Free donation").first()).toBeVisible();
  await page.getByRole("button", { name: "Owner view" }).click();
  await expect(
    page.getByText("Telangana Class 10 textbook set").first(),
  ).toBeVisible();
});

test("navigation is keyboard reachable and switches to Telugu", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Language").selectOption("te");
  await expect(page.getByRole("link", { name: "పని వెతకండి" }).first()).toBeVisible();
  await page.keyboard.press("Home");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
});
