"use server";

import { NextResponse } from "next/server";

import { categorizeExistingItems } from "@/lib/auto-categorize";
import { embedList } from "@/lib/embed-and-store";
import prisma from "@/lib/prisma";
import { resolveUserId } from "@/lib/resolve-user-id";

export async function PATCH(req: Request) {
  const userId = await resolveUserId();

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

    // Re-embed list and retroactively categorize matching items
    try {
      const embedding = await embedList(newListName.id, newListName.name, newListName.description);
      await categorizeExistingItems(newListName.id, embedding, userId);
    } catch (e) {
      console.error("Failed to embed/categorize list:", e);
    }

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
