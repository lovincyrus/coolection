"use server";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = auth();
  const body = await req.json();
  const { listId, itemId } = body;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const list = await prisma.list.findUnique({
      where: { id: listId },
    });

    if (!list) {
      return NextResponse.json({ message: "List not found" }, { status: 404 });
    }

    if (list.userId !== userId) {
      return NextResponse.json(
        { message: "Unauthorized to update this list" },
        { status: 403 }
      );
    }

    await prisma.list.update({
      where: { id: listId },
      data: { items: { connect: { id: itemId } } },
    });

    return NextResponse.json(
      { message: `List ${listId} updated successfully` },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `Failed to add ${itemId} to list`,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
