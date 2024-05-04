"use server";

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { listId, itemId } = body;

  try {
    await prisma.list.update({
      where: { id: listId },
      data: { items: { connect: { id: itemId } } },
    });

    return NextResponse.json(
      { message: `${itemId} added to list successfully` },
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
