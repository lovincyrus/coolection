"use server";

import { generateEmbedding } from "@/lib/generate-embedding";
import prisma from "@/lib/prisma";

import { Coolection } from "./types";

export async function searchCoolection(
  query: string
): Promise<Array<Coolection & { similarity: number }>> {
  try {
    if (query.trim().length === 0) return [];

    const embedding = await generateEmbedding(query);
    const vectorQuery = `[${embedding.join(",")}]`;
    const coolection = await prisma.$queryRaw`
    SELECT
      id,
      "title", "description", "url",
      1 - (embedding <=> ${vectorQuery}::vector) as similarity
    FROM coolection
    WHERE 1 - (embedding <=> ${vectorQuery}::vector) > .5
    ORDER BY similarity DESC
    LIMIT 8;
  `;

    return coolection as Array<Coolection & { similarity: number }>;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
