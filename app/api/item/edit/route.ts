import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  const { userId } = auth();

  const body = await req.json();
  const { item_id, title, description } = body;

  if (!item_id) {
    return NextResponse.json(
      { message: "Item ID is required" },
      { status: 400 },
    );
  }

  if (!title || title.trim() === "") {
    return NextResponse.json({ message: "Title is required" }, { status: 400 });
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
        { message: "Unauthorized to update this item" },
        { status: 403 },
      );
    }

    // TODO: Should have draft tags and mass create new tags

    // const existingTags = await prisma.tag.findMany({
    //   where: {
    //     items: {
    //       some: {
    //         itemId: item_id,
    //       },
    //     },
    //   },
    // });

    // const existingTagNames = existingTags.map((tag) => tag.name);

    // const tagsToAdd = newTags.filter(
    //   (tagName: string) => !existingTagNames.includes(tagName),
    // );

    // const manyTags = await Promise.all(
    //   tagsToAdd.map((tagName: string) => {
    //     return prisma.tag.create({
    //       data: {
    //         name: tagName,
    //         userId: userId,
    //       },
    //     });
    //   }),
    // );

    // const createdTags = await Promise.all(
    //   manyTags.map((tag) => {
    //     return prisma.itemTag.create({
    //       data: {
    //         item: {
    //           connect: { id: item_id },
    //         },
    //         tag: {
    //           connect: { id: tag.id },
    //         },
    //       },
    //     });
    //   }),
    // );

    // console.log("createdTags: ", createdTags);

    const updatedItem = await prisma.item.update({
      where: { id: item_id },
      data: {
        title: title,
        description: description,
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json(
      { message: `Item ${item_id} updated successfully`, item: updatedItem },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `Failed to update item ${item_id}`,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
