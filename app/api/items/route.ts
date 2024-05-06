"use server";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getLatestItems } from "@/lib/get-latest-items";

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const latestItems = await getLatestItems(userId as string);
    return NextResponse.json(latestItems);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: "Failed to fetch the latest items",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
}
