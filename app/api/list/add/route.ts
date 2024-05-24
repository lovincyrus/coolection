import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = auth();

  const body = await req.json();
  const { itemId, listId } = body;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }

  if (item.userId !== userId) {
    return NextResponse.json(
      { message: "Unauthorized to create list for this item" },
      { status: 403 },
    );
  }

  const existingItemList = await prisma.itemList.findFirst({
    where: {
      itemId: itemId,
      listId: listId,
    },
  });

  if (existingItemList) {
    return NextResponse.json(
      { message: "Item is already associated with this list" },
      { status: 400 },
    );
  }

  try {
    await prisma.itemList.create({
      data: {
        item: {
          connect: { id: itemId },
        },
        list: {
          connect: { id: listId },
        },
      },
    });

    return NextResponse.json(
      {
        message: `List ${listId} associated with item ${itemId}`,
        name: listId,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `Failed to create list for item ${itemId}`,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
