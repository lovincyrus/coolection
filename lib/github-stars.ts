import { ItemType, ListSource } from "@/app/types/coolection";

import { ensureSourceList } from "./ensure-source-list";
import prisma from "./prisma";

interface GitHubStarResponse {
  starred_at: string;
  repo: {
    full_name: string;
    html_url: string;
    description: string | null;
    owner: {
      avatar_url: string;
    };
    topics: string[];
    language: string | null;
    stargazers_count: number;
  };
}

export interface SyncResult {
  added: number;
  skipped: number;
  total: number;
}

const PER_PAGE = 100;
const MAX_PAGES = 50; // Cap at 5,000 stars to avoid rate limit exhaustion
const GITHUB_API = "https://api.github.com";

/**
 * Fetch a single page of starred repos from GitHub.
 * Uses the star+json media type to get starred_at timestamps.
 * Supports conditional requests via If-None-Match (ETag).
 */
async function fetchStarsPage(
  username: string,
  page: number,
  etag?: string | null,
): Promise<{ stars: GitHubStarResponse[]; etag: string | null; notModified: boolean }> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.star+json",
    "User-Agent": "Coolection",
  };

  // Use auth token if available (5,000 req/hr vs 60 req/hr)
  const githubToken = process.env.GITHUB_TOKEN;
  if (githubToken) {
    headers["Authorization"] = `Bearer ${githubToken}`;
  }

  // Only send If-None-Match on the first page to check if anything changed
  if (etag && page === 1) {
    headers["If-None-Match"] = etag;
  }

  const res = await fetch(
    `${GITHUB_API}/users/${encodeURIComponent(username)}/starred?per_page=${PER_PAGE}&page=${page}&sort=created&direction=desc`,
    { headers },
  );

  if (res.status === 304) {
    return { stars: [], etag: etag ?? null, notModified: true };
  }

  if (res.status === 404) {
    throw new Error(`GitHub user "${username}" not found`);
  }

  if (!res.ok) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    if (remaining === "0") {
      const resetAt = res.headers.get("x-ratelimit-reset");
      const resetDate = resetAt ? new Date(Number(resetAt) * 1000) : null;
      throw new Error(
        `GitHub API rate limit exceeded. Resets at ${resetDate?.toISOString() ?? "unknown"}.`,
      );
    }
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const newEtag = res.headers.get("etag");
  const stars: GitHubStarResponse[] = await res.json();

  return { stars, etag: newEtag, notModified: false };
}

/**
 * Sync GitHub stars for a user. Uses conditional requests (ETag) to avoid
 * wasting API calls when nothing has changed. On first sync or when stars
 * have changed, fetches all pages and upserts new stars as items.
 */
export async function syncGitHubStars(
  userId: string,
  githubUsername: string,
): Promise<SyncResult> {
  // Get existing sync state
  const syncState = await prisma.gitHubStarsSync.findUnique({
    where: { userId },
  });

  const existingEtag = syncState?.etag ?? null;

  // Fetch first page with conditional request
  const firstPage = await fetchStarsPage(githubUsername, 1, existingEtag);

  if (firstPage.notModified) {
    return { added: 0, skipped: 0, total: 0 };
  }

  // Collect all stars across pages
  let allStars = [...firstPage.stars];
  let page = 2;
  let lastPageLength = firstPage.stars.length;

  while (lastPageLength === PER_PAGE && page <= MAX_PAGES) {
    const nextPage = await fetchStarsPage(githubUsername, page);
    if (nextPage.stars.length === 0) break;
    allStars = allStars.concat(nextPage.stars);
    lastPageLength = nextPage.stars.length;
    page++;
  }

  // Get existing GitHub star URLs for this user to skip duplicates
  const existingUrls = new Set(
    (
      await prisma.item.findMany({
        where: { userId, type: ItemType._GITHUB_STAR, isDeleted: false },
        select: { url: true },
      })
    )
      .map((item) => item.url)
      .filter(Boolean),
  );

  // Separate new stars from duplicates
  const newStars = allStars.filter((star) => !existingUrls.has(star.repo.html_url));
  const skipped = allStars.length - newStars.length;

  // Ensure the "GitHub Stars" list exists for auto-grouping
  const listId = await ensureSourceList(userId, ListSource.GITHUB);

  // Batch insert new stars
  let added = 0;
  if (newStars.length > 0) {
    const newUrls = newStars.map((star) => star.repo.html_url);

    const result = await prisma.item.createMany({
      data: newStars.map((star) => ({
        url: star.repo.html_url,
        title: star.repo.full_name,
        description: star.repo.description,
        image: star.repo.owner.avatar_url,
        type: ItemType._GITHUB_STAR,
        metadata: {
          language: star.repo.language,
          stars: star.repo.stargazers_count,
          topics: star.repo.topics,
          starred_at: star.starred_at,
        },
        userId,
        createdAt: new Date(star.starred_at),
      })),
      skipDuplicates: true,
    });
    added = result.count;

    // Link newly created items to the GitHub Stars list
    if (added > 0) {
      const createdItems = await prisma.item.findMany({
        where: { userId, url: { in: newUrls }, type: ItemType._GITHUB_STAR },
        select: { id: true },
      });

      await prisma.itemList.createMany({
        data: createdItems.map((item) => ({
          itemId: item.id,
          listId,
        })),
        skipDuplicates: true,
      });
    }
  }

  // Update sync state
  await prisma.gitHubStarsSync.upsert({
    where: { userId },
    create: {
      userId,
      githubUsername,
      etag: firstPage.etag,
      lastSyncedAt: new Date(),
    },
    update: {
      githubUsername,
      etag: firstPage.etag,
      lastSyncedAt: new Date(),
    },
  });

  return { added, skipped, total: allStars.length };
}
