"use server";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { addToTweetTable } from "@/lib/add-to-tweet";
import { addToWebsite } from "@/lib/add-to-website";
import { isTwitterUrl, normalizeLink } from "@/lib/url";

export async function POST(req: Request) {
  const { userId } = auth();

  const body = await req.json();
  const { url } = body;

  if (!url) {
    return NextResponse.json({ message: "URL is required" }, { status: 400 });
  }

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const normalizedLink = normalizeLink(url);

  try {
    if (isTwitterUrl(normalizedLink)) {
      const tweetResult = await addToTweetTable(normalizedLink, userId);
    } else {
      const websiteResult = await addToWebsite(normalizedLink, userId);
    }

    return NextResponse.json(
      { message: "Item added successfully" },
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
