import prisma from "./prisma";

export const SOURCE_GH = "gh";
export const SOURCE_X = "x";

const SOURCE_LIST_CONFIG: Record<string, { name: string; slug: string; description: string }> = {
  [SOURCE_GH]: {
    name: "GitHub Stars",
    slug: "github-stars",
    description: "Starred repositories synced from GitHub.",
  },
  [SOURCE_X]: {
    name: "X Bookmarks",
    slug: "x-bookmarks",
    description: "Bookmarks synced from X (formerly Twitter).",
  },
};

/**
 * Find or create the source list for a given source type ("gh" or "x").
 * Returns the list id.
 */
export async function ensureSourceList(userId: string, source: string): Promise<string> {
  const config = SOURCE_LIST_CONFIG[source];
  if (!config) throw new Error(`Unknown source: ${source}`);

  const existing = await prisma.list.findFirst({
    where: { userId, source, isDeleted: false },
  });

  if (existing) return existing.id;

  const list = await prisma.list.create({
    data: {
      name: config.name,
      slug: config.slug,
      description: config.description,
      source,
      userId,
    },
  });

  return list.id;
}

/**
 * Assign items to a source list, skipping any that are already in it.
 */
export async function assignItemsToSourceList(
  listId: string,
  itemIds: string[],
): Promise<number> {
  if (itemIds.length === 0) return 0;

  const result = await prisma.itemList.createMany({
    data: itemIds.map((itemId) => ({ itemId, listId })),
    skipDuplicates: true,
  });

  return result.count;
}
