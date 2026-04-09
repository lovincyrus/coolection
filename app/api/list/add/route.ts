"use server";

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { resolveUserId } from "@/lib/resolve-user-id";

export async function POST(req: Request) {
  const userId = await resolveUserId();

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
      { message: "Unauthorized to create list for this item" },
      { status: 403 },
    );
  }

  const existingItemList = await prisma.itemList.findFirst({
    where: {
      itemId: item_id,
      listId: list_id,
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
          connect: { id: item_id },
        },
        list: {
          connect: { id: list_id },
        },
      },
    });

    return NextResponse.json(
      {
        message: `List ${list_id} associated with item ${item_id}`,
        name: list_id,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `Failed to create list for item ${item_id}`,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
