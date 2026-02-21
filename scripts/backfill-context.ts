#!/usr/bin/env ts-node
/**
 * Backfill context for existing items
 *
 * Usage: ts-node --compiler-options '{"module":"CommonJS"}' scripts/backfill-context.ts
 *
 * Environment:
 * - DATABASE_URL: PostgreSQL connection string (required)
 * - OPENAI_API_KEY: OpenAI API key (required)
 * - BATCH_SIZE: Number of items to process per batch (default: 10)
 * - LIMIT: Maximum number of items to process (default: unlimited)
 */

import prisma from "../lib/prisma";
import { enrichUrl } from "../lib/enrich-url";

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "10", 10);
const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : null;

async function backfillContext() {
  console.log(`Starting backfill with batch size: ${BATCH_SIZE}${LIMIT ? `, limit: ${LIMIT}` : ""}`);

  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalFailed = 0;

  try {
    // Find items without context in batches
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      if (LIMIT && totalProcessed >= LIMIT) {
        break;
      }

      const batchLimit = LIMIT ? Math.min(BATCH_SIZE, LIMIT - totalProcessed) : BATCH_SIZE;

      const items = await prisma.item.findMany({
        where: {
          context: null,
          isDeleted: false,
          // Only process websites and tweets (not github stars)
          type: {
            in: ["website", "tweet"],
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          content: true,
          type: true,
        },
        take: batchLimit,
        skip: offset,
      });

      if (items.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`\nProcessing batch of ${items.length} items (offset: ${offset})`);

      for (const item of items) {
        totalProcessed++;
        try {
          // For tweets, use author name (title) and content
          // For websites, use title and description
          const titleForEnrichment =
            item.type === "tweet" ? item.title : item.title || "";
          const contentForEnrichment =
            item.type === "tweet"
              ? item.content || ""
              : item.description || "";

          const enriched = await enrichUrl(
            titleForEnrichment,
            contentForEnrichment,
            item.type === "website" ? (item.content ?? undefined) : undefined,
          );

          await prisma.item.update({
            where: { id: item.id },
            data: { context: enriched.formatted },
          });

          totalUpdated++;
          console.log(`✓ Updated item ${item.id}`);
        } catch (error) {
          totalFailed++;
          console.error(
            `✗ Failed to enrich item ${item.id}:`,
            error instanceof Error ? error.message : "Unknown error",
          );
        }
      }

      offset += items.length;

      // Small delay between batches to avoid rate limiting
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n=== Backfill Summary ===");
  console.log(`Total processed: ${totalProcessed}`);
  console.log(`Successfully updated: ${totalUpdated}`);
  console.log(`Failed: ${totalFailed}`);
}

backfillContext();
