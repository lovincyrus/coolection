"use server";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { userId } = auth();

  const searchParams = new URL(req.url).searchParams;
  const page = Number(searchParams.get("page"));
  const limit = Number(searchParams.get("limit"));

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const skip = (page - 1) * limit;

    // See: https://www.prisma.io/docs/orm/prisma-client/queries/pagination#offset-pagination
    const latestItems = await prisma.item.findMany({
      where: {
        userId: userId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: skip,
    });

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
