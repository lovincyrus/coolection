"use server";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  const { userId } = auth();

  const body = await req.json();
  const { item_id } = body;

  if (!item_id) {
    return NextResponse.json(
      { message: "Item ID is required" },
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
        { message: "Unauthorized to delete this item" },
        { status: 403 },
      );
    }

    await prisma.item.update({
      where: { id: item_id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: `Item ${item_id} marked as deleted successfully` },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `Failed to mark item ${item_id} as deleted`,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
