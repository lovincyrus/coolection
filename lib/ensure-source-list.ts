import prisma from "./prisma";

const SOURCE_LIST_CONFIG: Record<string, { name: string; slug: string }> = {
  gh: { name: "GitHub Stars", slug: "github-stars" },
  x: { name: "X Bookmarks", slug: "x-bookmarks" },
};

/**
 * Find or create the canonical list for a given source (e.g. "gh" or "x").
 * Returns the list ID.
 */
export async function ensureSourceList(
  userId: string,
  source: string,
): Promise<string> {
  const config = SOURCE_LIST_CONFIG[source];
  if (!config) {
    throw new Error(`Unknown source: ${source}`);
  }

  const existing = await prisma.list.findFirst({
    where: { userId, source, isDeleted: false },
    select: { id: true },
  });

  if (existing) return existing.id;

  const created = await prisma.list.create({
    data: {
      name: config.name,
      slug: config.slug,
      source,
      userId,
    },
  });

  return created.id;
}
