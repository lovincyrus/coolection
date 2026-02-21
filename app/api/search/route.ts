import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { ItemWithSimilarity } from "@/app/types/coolection";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { userId } = auth();

  const searchParams = new URL(req.url).searchParams;
  const query = searchParams.get("q");

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!query || query.trim().length === 0) {
    return new NextResponse("Bad Request: Missing or empty query parameter", {
      status: 400,
    });
  }

  try {
    // Approach 1: Simple ILIKE search with context fields
    const results: Array<ItemWithSimilarity> = await prisma.$queryRaw`
      SELECT
        id,
        "title", "description", "url", "type", "content", "context", "metadata",
        1 as similarity
      FROM item
      WHERE
        (
          LOWER("title") ILIKE ${"%" + query.toLowerCase() + "%"}
          OR LOWER("description") ILIKE ${"%" + query.toLowerCase() + "%"}
          OR LOWER("url") ILIKE ${"%" + query.toLowerCase() + "%"}
          OR LOWER("context"::text) ILIKE ${"%" + query.toLowerCase() + "%"}
          OR ("type" = 'tweet' AND LOWER("content") ILIKE ${"%" + query.toLowerCase() + "%"})
        )
        AND "userId" = ${userId} AND "isDeleted" = false
      ORDER BY "title"
      LIMIT ${DEFAULT_PAGE_SIZE};
    `;

    // Approach 2: Full-text search
    // TODO: Add `fullTextSearch` to schema.prisma
    // See: https://www.prisma.io/docs/orm/prisma-client/queries/full-text-search#full-text-search-with-raw-sql
    // const results: Array<CoolectionItemWithSimilarity> = await prisma.$queryRaw`
    //   SELECT
    //     id,
    //     "title", "description", "url", "type", "content", "metadata", "isDeleted",
    //     1 as similarity
    //   FROM item
    //   WHERE to_tsvector('english', "title" || ' ' || "description" || ' ' || "url") @@ to_tsquery('english', ${query}) AND "userId" = ${userId} AND "isDeleted" = false
    //   ORDER BY "title"
    //   LIMIT 8;
    // `;

    // Approach 3: Vector search using OpenAI Embeddings
    // See: https://platform.openai.com/docs/guides/embeddings/what-are-embeddings
    // See: https://github.com/ollama/ollama/issues/2416
    // const embedding = await generateEmbedding(query);
    // const vectorQuery = `[${embedding.join(",")}]`;

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

    // Approach 4: Hybrid search using OpenAI Embeddings and ILIKE
    // const embedding = await generateEmbedding(query);
    // const vectorQuery = `[${embedding.join(",")}]`;

    // SELECT
    //   id,
    //   "title", "description", "url", "type", "content", "metadata", "isDeleted",
    //   1 - (embedding <=> ${vectorQuery}::vector) as similarity
    // FROM item
    // WHERE
    //   (1 - (embedding <=> ${vectorQuery}::vector) > .7
    //   OR LOWER("title") ILIKE ${"%" + query.toLowerCase() + "%"}
    //   OR LOWER("description") ILIKE ${"%" + query.toLowerCase() + "%"}
    //   OR LOWER("url") ILIKE ${"%" + query.toLowerCase() + "%"})
    //   AND "userId" = ${userId} AND "isDeleted" = false
    // ORDER BY similarity DESC
    // LIMIT 8;
    // `;

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to search items",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
