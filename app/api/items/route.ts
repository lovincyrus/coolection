"use server";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getLatestItems } from "@/lib/data/get-latest-items";

export async function GET(req: NextRequest) {
  const { userId } = auth();

  const searchParams = new URL(req.url).searchParams;
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const latestItems = await getLatestItems(
      userId.toString(),
      Number(page),
      Number(limit),
    );
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
