"use server";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { addTweet } from "@/lib/add-tweet";
import { addWebsite } from "@/lib/add-website";
import { checkDuplicateItem } from "@/lib/check-duplicate.item";
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

  // Check for duplicate URL before adding the item
  const isDuplicate = await checkDuplicateItem(normalizedLink, userId);
  if (isDuplicate) {
    return NextResponse.json(
      { message: "Item already exists" },
      { status: 409 }
    );
  }

  try {
    let newItem;
    if (isTwitterUrl(normalizedLink)) {
      const newTweet = await addTweet(normalizedLink, userId);
      newItem = newTweet;
    } else {
      const newWebsite = await addWebsite(normalizedLink, userId);
      newItem = newWebsite
    }

    return NextResponse.json(
      { message: "Item added successfully", item: newItem },
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
