import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  const { userId } = auth();

  const body = await req.json();
  const { item_id, list_id } = body;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const item = await prisma.item.findUnique({
    where: { id: item_id },
  });

  if (!item) {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }

  if (item.userId !== userId) {
    return NextResponse.json(
      { message: "Unauthorized to remove item from this list" },
      { status: 403 },
    );
  }

  const existingItemList = await prisma.itemList.findFirst({
    where: {
      itemId: item_id,
      listId: list_id,
    },
  });

  if (!existingItemList) {
    return NextResponse.json(
      { message: "Item is not associated with this list" },
      { status: 400 },
    );
  }

  try {
    await prisma.itemList.delete({
      where: {
        itemId_listId: {
          itemId: item_id,
          listId: list_id,
        },
      },
    });

    return NextResponse.json(
      { message: `Item ${item_id} removed from list ${list_id}` },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `Failed to remove item ${item_id} from list ${list_id}`,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
