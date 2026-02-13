"use server";

import { NextResponse } from "next/server";

import { ListSource } from "@/app/types/coolection";
import { addTwitterPostOrBookmark } from "@/lib/add-twitter-post-or-bookmark";
import { addWebsite } from "@/lib/add-website";
import { checkDuplicateItem } from "@/lib/check-duplicate-item";
import { ensureSourceList } from "@/lib/ensure-source-list";
import prisma from "@/lib/prisma";
import { resolveUserId } from "@/lib/resolve-user-id";
import { isTwitterPostOrBookmarkUrl, normalizeLink } from "@/lib/url";

export async function POST(req: Request) {
  const userId = await resolveUserId();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { url } = body;

  if (!url) {
    return NextResponse.json({ message: "URL is required" }, { status: 400 });
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

      // Auto-group into X Bookmarks list
      const listId = await ensureSourceList(userId, ListSource.X);
      await prisma.itemList.create({
        data: { itemId: newItem.id, listId },
      });
    } else {
      const newWebsite = await addWebsite(normalizedLink, userId);
      newItem = newWebsite;
    }

    return NextResponse.json(
      { message: "Item added successfully", item: newItem },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to add the link",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
