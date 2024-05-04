"use server";

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  const body = await req.json();
  const { itemId } = body;

  if (!itemId) {
    return NextResponse.json(
      { message: "Item ID is required" },
      { status: 400 }
    );
  }

  try {
    await prisma.item.update({
      where: { id: itemId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: `Item ${itemId} marked as deleted successfully` },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `Failed to mark item ${itemId} as deleted`,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
