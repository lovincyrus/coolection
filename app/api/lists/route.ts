"use server";

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { resolveUserId } from "@/lib/resolve-user-id";

export async function GET() {
  const userId = await resolveUserId();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const lists = await prisma.list.findMany({
      where: {
        userId: userId,
        isDeleted: false,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(lists);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch lists",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
