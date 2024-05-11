import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { CoolectionItemWithSimilarity } from "@/app/types/coolection";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { userId } = auth();
  const query = req.nextUrl.searchParams.get("q");

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!query || query.trim().length === 0) {
    return new NextResponse("Bad Request: Missing or empty query parameter", {
      status: 400,
    });
  }

  try {
    const results: Array<CoolectionItemWithSimilarity> = await prisma.$queryRaw`
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

    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: "Failed to search items",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  }
}
