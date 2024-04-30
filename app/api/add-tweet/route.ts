"use server";

import { NextResponse } from "next/server";

import { addToTweetTable } from "@/lib/add-to-tweet";

export async function POST(req: Request) {
  const body = await req.json();
  const { twitterUrl } = body;

  try {
    await addToTweetTable(twitterUrl);

    return NextResponse.json(
      { message: "Tweet added successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: "Failed to add the tweet",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
}
