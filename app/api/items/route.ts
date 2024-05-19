"use server";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getLatestItems } from "@/lib/data/get-latest-items";

export async function GET(req: NextRequest) {
  const { userId } = auth();

  const limit = Number(req.nextUrl.searchParams.get("limit"));
  const page = Number(req.nextUrl.searchParams.get("page"));

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const latestItems = await getLatestItems(userId as string, limit, page);
    return NextResponse.json(latestItems);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: "Failed to fetch the latest items",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  }
}
