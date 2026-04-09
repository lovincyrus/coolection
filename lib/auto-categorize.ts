import prisma from "./prisma";

const SIMILARITY_THRESHOLD = 0.55;
const MAX_LISTS = 3;

/**
 * Find user lists whose embeddings are most similar to the given item embedding.
 * Returns list IDs that exceed the similarity threshold.
 */
export async function findMatchingLists(
  itemEmbedding: number[],
  userId: string,
): Promise<{ id: string; name: string; similarity: number }[]> {
  const embeddingStr = JSON.stringify(itemEmbedding);

  const results = await prisma.$queryRaw<
    { id: string; name: string; similarity: number }[]
  >`
    SELECT l.id, l.name, 1 - (l.embedding <=> ${embeddingStr}::vector) AS similarity
    FROM list l
    WHERE l."userId" = ${userId}
      AND l."isDeleted" = false
      AND l.source IS NULL
      AND l.embedding IS NOT NULL
      AND 1 - (l.embedding <=> ${embeddingStr}::vector) > ${SIMILARITY_THRESHOLD}
    ORDER BY similarity DESC
    LIMIT ${MAX_LISTS};
  `;

  return results;
}

/**
 * Auto-categorize an item into matching lists based on embedding similarity.
 */
export async function autoCategorize(
  itemId: string,
  itemEmbedding: number[],
  userId: string,
): Promise<string[]> {
  const matches = await findMatchingLists(itemEmbedding, userId);

  if (matches.length === 0) return [];

  await prisma.itemList.createMany({
    data: matches.map((m) => ({ itemId, listId: m.id })),
    skipDuplicates: true,
  });

  console.log(
    `Auto-categorized item ${itemId} into: ${matches.map((m) => `${m.name} (${m.similarity.toFixed(2)})`).join(", ")}`,
  );

  return matches.map((m) => m.id);
}

const MAX_ITEMS_PER_LIST = 100;

/**
 * Retroactively categorize existing items into a newly created/updated list.
 * Finds items whose embeddings are similar to the list embedding and assigns them.
 */
export async function categorizeExistingItems(
  listId: string,
  listEmbedding: number[],
  userId: string,
): Promise<number> {
  const embeddingStr = JSON.stringify(listEmbedding);

  const matchingItems = await prisma.$queryRaw<{ id: string; title: string; similarity: number }[]>`
    SELECT i.id, i.title, 1 - (i.embedding <=> ${embeddingStr}::vector) AS similarity
    FROM item i
    WHERE i."userId" = ${userId}
      AND i."isDeleted" = false
      AND i.embedding IS NOT NULL
      AND i.id NOT IN (SELECT il."itemId" FROM item_list il WHERE il."listId" = ${listId})
      AND 1 - (i.embedding <=> ${embeddingStr}::vector) > ${SIMILARITY_THRESHOLD}
    ORDER BY similarity DESC
    LIMIT ${MAX_ITEMS_PER_LIST};
  `;

  if (matchingItems.length === 0) return 0;

  await prisma.itemList.createMany({
    data: matchingItems.map((item) => ({ itemId: item.id, listId })),
    skipDuplicates: true,
  });

  console.log(
    `Retroactively categorized ${matchingItems.length} items into list ${listId}: ${matchingItems.map((i) => `${i.title} (${i.similarity.toFixed(2)})`).join(", ")}`,
  );

  return matchingItems.length;
}
