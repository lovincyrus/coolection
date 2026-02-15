import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";

setup("global setup", async ({}) => {
  await clerkSetup();
});

setup("authenticate", async ({ page }) => {
  // Create a sign-in token via Clerk Backend API (no password auth needed)
  const response = await fetch("https://api.clerk.com/v1/sign_in_tokens", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: process.env.E2E_CLERK_USER_ID }),
  });
  const { token } = await response.json();

  await page.goto("/");
  await clerk.signIn({
    page,
    signInParams: {
      strategy: "ticket",
      ticket: token,
    },
  });
  // clerk.signIn() authenticates client-side; navigate to /home to verify
  await page.goto("/home");
  await page.waitForLoadState("networkidle");
  await page.context().storageState({ path: "e2e/.auth/user.json" });
});
