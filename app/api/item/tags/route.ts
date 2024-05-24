"use server";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { userId } = auth();

  const searchParams = new URL(req.url).searchParams;
  const itemId = searchParams.get("item_id");

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!itemId) {
    return NextResponse.json(
      { message: "Item ID is required" },
      { status: 400 },
    );
  }

  try {
    const tags = await prisma.itemTag.findMany({
      where: {
        itemId: itemId,
      },
      include: {
        tag: true,
      },
    });
    return NextResponse.json(tags);
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
