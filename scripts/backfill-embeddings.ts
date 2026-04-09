#!/usr/bin/env ts-node

import prisma from "../lib/prisma";
import { embedItem } from "../lib/embed-and-store";
import { autoCategorize } from "../lib/auto-categorize";

const BATCH_SIZE = 10;

async function backfillEmbeddings() {
  console.log("Starting embedding backfill...");

  try {
    // Find all items without embeddings using raw SQL
    const itemsWithoutEmbedding = await prisma.$queryRaw<
      Array<{ id: string; title: string; description: string | null; userId: string }>
    >`
      SELECT id, title, description, "userId"
      FROM item
      WHERE embedding IS NULL AND "isDeleted" = false
      ORDER BY "createdAt" DESC
    `;

    console.log(`Found ${itemsWithoutEmbedding.length} items without embeddings`);

    if (itemsWithoutEmbedding.length === 0) {
      console.log("No items to backfill.");
      return;
    }

    // Process in batches
    let processed = 0;
    for (let i = 0; i < itemsWithoutEmbedding.length; i += BATCH_SIZE) {
      const batch = itemsWithoutEmbedding.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (item) => {
          try {
            const embedding = await embedItem(item.id, item.title, item.description);
            await autoCategorize(item.id, embedding, item.userId);
            processed++;
            console.log(`[${processed}/${itemsWithoutEmbedding.length}] Embedded item ${item.id}`);
          } catch (error) {
            console.error(`Failed to embed item ${item.id}:`, error);
          }
        }),
      );
    }

    console.log(`✓ Backfill complete. Processed ${processed} items.`);
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backfillEmbeddings();
