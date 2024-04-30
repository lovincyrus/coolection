"use server";

import { NextResponse } from "next/server";

import { addToCollection } from "../../../lib/crud";

export async function POST(req: Request) {
  const body = await req.json();
  const { link } = body;

  try {
    await addToCollection(link);

    return NextResponse.json(
      { message: "Link added successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: "Failed to add the link",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
}
