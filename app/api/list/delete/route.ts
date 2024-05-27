"use server";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function DELETE(req: Request) {
  const { userId } = auth();

  const body = await req.json();
  const { list_id } = body;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const deletedList = await prisma.list.update({
      where: {
        id: list_id,
        userId: userId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: `List ${deletedList.name} deleted successfully` },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: "Failed to delete the list",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  }
}
