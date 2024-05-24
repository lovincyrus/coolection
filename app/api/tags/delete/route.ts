"use server";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function DELETE(req: Request) {
  const { userId } = auth();

  const body = await req.json();
  const { tag_name } = body;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const tagToDelete = await prisma.tag.findFirst({
      where: {
        userId: userId,
        name: tag_name,
      },
    });

    await prisma.tag.delete({
      where: {
        id: tagToDelete.id,
        userId: userId,
      },
    });

    return NextResponse.json(
      { message: `Tag ${tag_name} deleted successfully` },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: "Failed to delete the tag",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  }
}
