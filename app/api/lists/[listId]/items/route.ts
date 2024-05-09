"use server";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

interface Context {
  params: {
    listId: string;
  };
}

export async function GET(req: Request, ctx: Context) {
  const { userId } = auth();
  const { params } = ctx;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const listWithItems = await prisma.list.findUnique({
      where: { id: params.listId },
      include: {
        items: true,
      },
    });
    const items = listWithItems?.items;

    return NextResponse.json(items);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: "Failed to fetch items from the list",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  }
}