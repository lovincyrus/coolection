"use server";

import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { addTwitterPostOrBookmark } from "@/lib/add-twitter-post-or-bookmark";
import { addWebsite } from "@/lib/add-website";
import { checkDuplicateItem } from "@/lib/check-duplicate-item";
import prisma from "@/lib/prisma";
import { isTwitterPostOrBookmarkUrl, normalizeLink } from "@/lib/url";

export async function POST(req: Request) {
  let userId: string | null = null;
  const authorization = headers().get("authorization");

  if (authorization?.startsWith("Bearer coolection_")) {
    const token = authorization.substring(7);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const apiToken = await prisma.apiToken.findUnique({
      where: { tokenHash },
      select: { userId: true },
    });
    userId = apiToken?.userId ?? null;
  } else {
    userId = auth().userId;
  }

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
      { status: 409 },
    );
  }

  try {
    let newItem;
    if (isTwitterPostOrBookmarkUrl(normalizedLink)) {
      const newTweet = await addTwitterPostOrBookmark(normalizedLink, userId);
      newItem = newTweet;
    } else {
      const newWebsite = await addWebsite(normalizedLink, userId);
      newItem = newWebsite;
    }

    return NextResponse.json(
      { message: "Item added successfully", item: newItem },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: "Failed to add the link",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  }
}
