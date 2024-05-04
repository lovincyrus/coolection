"use server";

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  const body = await req.json();
  const { listId } = body;

  if (!listId) {
    return NextResponse.json(
      { message: "List ID is required" },
      { status: 400 }
    );
  }

  try {
    await prisma.list.update({
      where: { id: listId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: `List ${listId} marked as deleted successfully` },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `Failed to mark list ${listId} as deleted`,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
