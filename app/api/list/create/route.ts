import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = auth();

  const body = await req.json();
  const { item_id, tag_name } = body;

  if (!tag_name || tag_name.trim() === "") {
    return NextResponse.json(
      { message: "Tag name is required" },
      { status: 400 },
    );
  }

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const item = await prisma.item.findUnique({
      where: { id: item_id },
    });

    if (!item) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    if (item.userId !== userId) {
      return NextResponse.json(
        { message: "Unauthorized to create tag for this item" },
        { status: 403 },
      );
    }

    const existingTag = await prisma.list.findFirst({
      where: {
        userId: userId,
        name: tag_name,
      },
    });

    if (existingTag) {
      await prisma.itemList.create({
        data: {
          item: {
            connect: { id: item_id },
          },
          list: {
            connect: { id: existingTag.id },
          },
        },
      });

      return NextResponse.json(
        {
          message: `List ${tag_name} associated with item ${item_id}`,
          name: tag_name,
        },
        { status: 200 },
      );
    } else {
      const newList = await prisma.list.create({
        data: {
          name: tag_name,
          userId: userId,
        },
      });

      await prisma.itemList.create({
        data: {
          item: {
            connect: { id: item_id },
          },
          list: {
            connect: { id: newList.id },
          },
        },
      });

      return NextResponse.json(
        {
          message: `List ${tag_name} created and associated with item ${item_id}`,
          name: tag_name,
        },
        { status: 200 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: `Failed to create tag for item ${item_id}`,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
