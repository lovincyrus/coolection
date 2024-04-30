"use server";

import prisma from "@/lib/prisma";

interface Coolection {
  id: string;
  url: string;
  title: string;
  description: string;
  image?: string;
  embedding: number[];
  createdAt?: string;
  updatedAt?: string;
}

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

// export async function searchCoolection(
//   query: string
// ): Promise<Array<Coolection & { similarity: number }>> {
//   try {
//     if (query.trim().length === 0) return [];

//     const coolection = await prisma.$queryRaw`
//     SELECT
//       id,
//       "title", "description", "url"
//     FROM coolection
//     WHERE
//       "title" ILIKE '%' || ${query} || '%'
//       OR "description" ILIKE '%' || ${query} || '%'
//     ORDER BY "createdAt" DESC
//     LIMIT 8;
//   `;

//     return coolection.map((coolectionItem) => ({
//       ...coolectionItem,
//       similarity: 1, // Assuming a fixed similarity score
//     })) as Array<Coolection & { similarity: number }>;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }
