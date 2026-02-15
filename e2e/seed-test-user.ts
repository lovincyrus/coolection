import prisma from "../lib/prisma";

const TEST_CLERK_ID = process.env.E2E_CLERK_USER_ID!;
const TEST_EMAIL = process.env.E2E_CLERK_USER_USERNAME!;

async function seedTestUser() {
  await prisma.user.upsert({
    where: { id: TEST_CLERK_ID },
    update: {},
    create: {
      id: TEST_CLERK_ID,
      email: TEST_EMAIL,
    },
  });
  console.log(`Test user seeded: ${TEST_CLERK_ID}`);
}

seedTestUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed test user:", error);
    process.exit(1);
  });
