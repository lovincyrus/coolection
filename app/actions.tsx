"use server";

import { generateEmbedding } from "@/lib/generate-embedding";
import prisma from "@/lib/prisma";

import { CoolectionItem } from "./types";

export async function searchCoolection(
  query: string
): Promise<Array<CoolectionItem & { similarity: number }>> {
  try {
    if (query.trim().length === 0) return [];

    const embedding = await generateEmbedding(query);
    const vectorQuery = `[${embedding.join(",")}]`;

    const results: Array<any> = await prisma.$queryRaw`
    SELECT
      id,
      "title", "description", "url", "type", "content", "metadata",
      1 - (embedding <=> ${vectorQuery}::vector) as similarity
    FROM item
    WHERE 1 - (embedding <=> ${vectorQuery}::vector) > .5
    ORDER BY similarity DESC
    LIMIT 8;
  `;

    return results as Array<CoolectionItem & { similarity: number }>;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
