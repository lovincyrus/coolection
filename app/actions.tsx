"use server";

import { generateEmbedding } from "@/lib/generate-embedding";
import prisma from "@/lib/prisma";

import { CoolectionItem } from "./types";

export async function searchCoolection(
  query: string,
  userId: string
): Promise<Array<CoolectionItem & { similarity: number }>> {
  try {
    if (query.trim().length === 0) return [];

    // NOTE: Otherwise we'd be burning through openai credits
    // See: https://github.com/ollama/ollama/issues/2416
    if (process.env.NODE_ENV === "development") {
      // Use ILIKE for local development
      const results: Array<any> = await prisma.$queryRaw`
      SELECT
        id,
        "title", "description", "url", "type", "content", "metadata", "isDeleted",
        1 as similarity
      FROM item
      WHERE ("title" || ' ' || "description" || ' ' || "url") ILIKE ${
        "%" + query + "%"
      } AND "userId" = ${userId}
      ORDER BY "title"
      LIMIT 8;
      `;
      return results as Array<CoolectionItem & { similarity: number }>;
    } else {
      // Use embedding and vector search in production
      const embedding = await generateEmbedding(query);
      const vectorQuery = `[${embedding.join(",")}]`;

      const results: Array<any> = await prisma.$queryRaw`
      SELECT
        id,
        "title", "description", "url", "type", "content", "metadata", "isDeleted",
        1 - (embedding <=> ${vectorQuery}::vector) as similarity
      FROM item
      WHERE 1 - (embedding <=> ${vectorQuery}::vector) > .7 AND "userId" = ${userId}
      ORDER BY similarity DESC
      LIMIT 8;
      `;
      return results as Array<CoolectionItem & { similarity: number }>;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
