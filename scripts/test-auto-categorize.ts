/**
 * Test script for auto-categorization using local embeddings + pgvector.
 *
 * Usage:
 *   pnpm tsx scripts/test-auto-categorize.ts
 *
 * Prerequisites:
 *   - Database running with pgvector extension
 *   - Schema pushed (pnpm db:push)
 */

import { generateLocalEmbedding } from "../lib/local-embedding";
import { findMatchingLists } from "../lib/auto-categorize";
import prisma from "../lib/prisma";

// Sample lists to create and embed
const TEST_LISTS = [
  { name: "Frontend Development", description: "React, CSS, JavaScript, UI frameworks" },
  { name: "AI & Machine Learning", description: "Neural networks, LLMs, deep learning, NLP" },
  { name: "DevOps & Infrastructure", description: "Docker, Kubernetes, CI/CD, cloud deployment" },
  { name: "Design Inspiration", description: "UI design, typography, color palettes, branding" },
  { name: "Cooking Recipes", description: "Food, recipes, cooking techniques, restaurants" },
];

// Sample items to test categorization against
const TEST_ITEMS = [
  { url: "https://react.dev/blog", title: "React 19 — What's New", description: "Overview of the latest React features and improvements" },
  { url: "https://arxiv.org/abs/2401.00001", title: "Scaling Laws for LLMs", description: "A study on how large language models scale with compute and data" },
  { url: "https://kubernetes.io/docs", title: "Kubernetes Documentation", description: "Production-grade container orchestration" },
  { url: "https://dribbble.com/shots/123", title: "Modern Dashboard Design", description: "Clean minimal dashboard with beautiful typography" },
  { url: "https://seriouseats.com/pasta", title: "Perfect Pasta Carbonara", description: "The authentic Italian recipe with guanciale and pecorino" },
  { url: "https://news.ycombinator.com", title: "Hacker News", description: "Tech news and discussions" },
];

const TEST_USER_ID = "test-auto-categorize";

async function cleanup() {
  // Remove test data
  const lists = await prisma.list.findMany({ where: { userId: TEST_USER_ID } });
  const listIds = lists.map((l) => l.id);
  if (listIds.length > 0) {
    await prisma.itemList.deleteMany({ where: { listId: { in: listIds } } });
  }
  await prisma.item.deleteMany({ where: { userId: TEST_USER_ID } });
  await prisma.list.deleteMany({ where: { userId: TEST_USER_ID } });
}

async function main() {
  console.log("=== Auto-Categorization Test ===\n");

  // Ensure test user exists
  await prisma.user.upsert({
    where: { id: TEST_USER_ID },
    update: {},
    create: { id: TEST_USER_ID, email: "test-categorize@example.com" },
  });

  await cleanup();

  // Step 1: Create lists and embed them
  console.log("1. Creating and embedding test lists...\n");
  for (const list of TEST_LISTS) {
    const embedding = await generateLocalEmbedding(`${list.name} ${list.description}`);
    const created = await prisma.list.create({
      data: {
        name: list.name,
        slug: list.name.toLowerCase().replace(/ /g, "-"),
        description: list.description,
        userId: TEST_USER_ID,
      },
    });
    await prisma.$executeRaw`
      UPDATE list SET embedding = ${JSON.stringify(embedding)}::vector WHERE id = ${created.id}
    `;
    console.log(`  ✓ ${list.name} (embedded ${embedding.length} dims)`);
  }

  // Step 2: Embed items and find matching lists
  console.log("\n2. Testing item categorization...\n");
  for (const item of TEST_ITEMS) {
    const embedding = await generateLocalEmbedding(`${item.title} ${item.description ?? ""}`);
    const matches = await findMatchingLists(embedding, TEST_USER_ID);

    console.log(`  "${item.title}"`);
    if (matches.length === 0) {
      console.log("    → No matching lists\n");
    } else {
      for (const m of matches) {
        console.log(`    → ${m.name} (similarity: ${Number(m.similarity).toFixed(3)})`);
      }
      console.log();
    }
  }

  // Cleanup
  await cleanup();
  await prisma.user.delete({ where: { id: TEST_USER_ID } });

  console.log("=== Done ===");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
