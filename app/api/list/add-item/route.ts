"use server";

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// export async function PUT(req: Request) {
//   const body = await req.json();
//   const { listId, itemId, itemType } = body;

//   try {
//     if (itemType === "website") {
//       await prisma.list.update({
//         where: { id: listId },
//         data: { websites: { connect: { id: itemId } } },
//       });
//     } else if (itemType === "tweet") {
//       await prisma.list.update({
//         where: { id: listId },
//         data: { tweets: { connect: { id: itemId } } },
//       });
//     }

//     return NextResponse.json(
//       { message: `${itemType} added to list successfully` },
//       { status: 200 }
//     );
//   } catch (error) {
// return NextResponse.json(
//   {
//     message: `Failed to add ${itemType} to list`,
//     error: error instanceof Error ? error.message : "Unknown error",
//   },
//   { status: 500 }
// );
//   }
// }

export async function PUT(req: Request) {
  const body = await req.json();
  const { listId, itemId } = body;

  try {
    // Assuming 'items' is a field on the 'List' model that relates to a collection of items
    const updatedList = await prisma.list.update({
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
