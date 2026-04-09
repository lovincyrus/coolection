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
