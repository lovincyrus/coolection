import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

function slugify(text: string) {
  return text.toLowerCase().replace(/ /g, "-");
}

export async function POST(req: Request) {
  const { userId } = auth();

  const body = await req.json();
  const { list_name } = body;

  if (!list_name || list_name.trim() === "") {
    return NextResponse.json(
      { message: "List name is required" },
      { status: 400 },
    );
  }

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const existingList = await prisma.list.findFirst({
      where: {
        userId: userId,
        name: list_name,
      },
    });

    if (existingList) {
      return NextResponse.json(
        { message: "List already exists" },
        { status: 409 },
      );
    }

    const createdList = await prisma.list.create({
      data: {
        name: list_name,
        slug: slugify(list_name),
        userId: userId,
      },
    });

    return NextResponse.json(
      {
        message: `List ${createdList.name} created successfully`,
        name: list_name,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to create list",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
