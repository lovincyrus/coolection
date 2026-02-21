/**
 * Backfill script to enrich existing URLs with context metadata.
 *
 * Usage: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/backfill-context.ts
 *
 * This script processes all items without context and calls the enrichment API
 * to populate their context field with creator, organization, content type, and topics.
 *
 * Process items in batches to avoid rate limiting and long-running operations.
 */

import { enrichUrl } from "../lib/enrich-url";
import prisma from "../lib/prisma";

const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES_MS = 1000; // 1 second delay between batches

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function backfillContext() {
  console.log("Starting context backfill process...");

  try {
    // Get count of items without context
    const count = await prisma.item.count({
      where: {
        context: null,
        isDeleted: false,
        url: { not: null },
      },
    });

    console.log(`Found ${count} items without context to enrich`);

    if (count === 0) {
      console.log("No items to backfill. Exiting.");
      return;
    }

    let processed = 0;
    let enriched = 0;
    let failed = 0;

    // Process in batches
    for (let i = 0; i < count; i += BATCH_SIZE) {
      const batch = await prisma.item.findMany({
        where: {
          context: null,
          isDeleted: false,
          url: { not: null },
        },
        take: BATCH_SIZE,
        skip: i,
        select: {
          id: true,
          url: true,
          title: true,
          description: true,
        },
      });

      console.log(
        `\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(count / BATCH_SIZE)} (${batch.length} items)`
      );

      for (const item of batch) {
        try {
          console.log(`  Enriching: ${item.title} (${item.url})`);

          const context = await enrichUrl(
            item.url || "",
            item.title,
            item.description || undefined
          );

          if (context) {
            await prisma.item.update({
              where: { id: item.id },
              data: { context },
            });
            enriched++;
            console.log(`    ✓ Enriched`);
          } else {
            console.log(`    ✗ Enrichment returned null (API error or no key)`);
            failed++;
          }
        } catch (error) {
          failed++;
          console.error(
            `    ✗ Error enriching ${item.title}:`,
            error instanceof Error ? error.message : "Unknown error"
          );
        }

        processed++;
      }

      // Delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < count) {
        console.log(`Waiting ${DELAY_BETWEEN_BATCHES_MS}ms before next batch...`);
        await sleep(DELAY_BETWEEN_BATCHES_MS);
      }
    }

    console.log(`\n✓ Backfill complete!`);
    console.log(`  Total processed: ${processed}`);
    console.log(`  Successfully enriched: ${enriched}`);
    console.log(`  Failed: ${failed}`);
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backfillContext();
