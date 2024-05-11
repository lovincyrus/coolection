"use server";

import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

import { CoolectionItemWithSimilarity } from "./types";

// TODO: moved to /api/search; clean up
export async function searchCoolection(
  query: string,
): Promise<Array<CoolectionItemWithSimilarity>> {
  const { userId } = auth();

  try {
    if (query.trim().length === 0) return [];

    const results: Array<any> = await prisma.$queryRaw`
      SELECT
        id,
        "title", "description", "url", "type", "content", "metadata", "isDeleted",
        1 as similarity
      FROM item
      WHERE ("title" || ' ' || "description" || ' ' || "url") ILIKE ${
        "%" + query + "%"
      } AND "userId" = ${userId} AND "isDeleted" = false
      ORDER BY "title"
      LIMIT 8;
      `;
    return results as Array<CoolectionItemWithSimilarity>;

    // UNCOMMENT TO RE-ENABLE VECTOR SEARCH
    // NOTE: Otherwise we'd be burning through openai credits
    // See: https://github.com/ollama/ollama/issues/2416
    // Use embedding and vector search in production
    // const embedding = await generateEmbedding(query);
    // const vectorQuery = `[${embedding.join(",")}]`;

    // const results: Array<any> = await prisma.$queryRaw`
    // SELECT
    //   id,
    //   "title", "description", "url", "type", "content", "metadata", "isDeleted",
    //   1 - (embedding <=> ${vectorQuery}::vector) as similarity
    // FROM item
    // WHERE 1 - (embedding <=> ${vectorQuery}::vector) > .7 AND "userId" = ${userId}
    // ORDER BY similarity DESC
    // LIMIT 8;
    // `;
    // return results as Array<CoolectionItem & { similarity: number }>;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
