"use server";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  const { userId } = auth();

  const body = await req.json();
  const { list_id, name } = body;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const newListName = await prisma.list.update({
      where: {
        id: list_id,
        userId: userId,
      },
      data: {
        name: name,
      },
    });

    return NextResponse.json(
      { message: `List ${newListName.name} name updated successfully` },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: "Failed to update the list name",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  }
}
