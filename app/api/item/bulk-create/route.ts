import { NextResponse } from "next/server";

import { addTwitterPostOrBookmark } from "@/lib/add-twitter-post-or-bookmark";
import { addWebsite } from "@/lib/add-website";
import { checkDuplicateItem } from "@/lib/check-duplicate-item";
import { resolveUserId } from "@/lib/resolve-user-id";
import { isTwitterPostOrBookmarkUrl, normalizeLink } from "@/lib/url";

const MAX_URLS_PER_REQUEST = 100;
const URL_PATTERN = /^https?:\/\//;

export async function POST(req: Request) {
  const userId = await resolveUserId();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let body: { urls?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body" },
      { status: 400 },
    );
  }
  const { urls } = body;

  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json(
      { message: "urls array is required" },
      { status: 400 },
    );
  }

  if (urls.length > MAX_URLS_PER_REQUEST) {
    return NextResponse.json(
      { message: `Maximum ${MAX_URLS_PER_REQUEST} URLs per request` },
      { status: 400 },
    );
  }

  const results: { url: string; status: "created" | "duplicate" | "failed"; error?: string }[] = [];

  for (const url of urls) {
    if (!url || typeof url !== "string" || !URL_PATTERN.test(url)) {
      results.push({ url: url ?? "", status: "failed", error: "Invalid URL" });
      continue;
    }

    try {
      const normalizedLink = normalizeLink(url);

      const isDuplicate = await checkDuplicateItem(normalizedLink, userId);
      if (isDuplicate) {
        results.push({ url, status: "duplicate" });
        continue;
      }

      if (isTwitterPostOrBookmarkUrl(normalizedLink)) {
        await addTwitterPostOrBookmark(normalizedLink, userId);
      } else {
        await addWebsite(normalizedLink, userId);
      }

      results.push({ url, status: "created" });
    } catch (error) {
      results.push({
        url,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  const created = results.filter((r) => r.status === "created").length;
  const duplicates = results.filter((r) => r.status === "duplicate").length;
  const failed = results.filter((r) => r.status === "failed").length;

  return NextResponse.json(
    { created, duplicates, failed, results },
    { status: 200 },
  );
}
