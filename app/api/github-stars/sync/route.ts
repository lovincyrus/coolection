"use server";

import { NextResponse } from "next/server";

import { resolveUserId } from "@/lib/resolve-user-id";
import { syncGitHubStars } from "@/lib/github-stars";

export async function POST(req: Request) {
  const userId = await resolveUserId();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { githubUsername } = body;

  if (!githubUsername || typeof githubUsername !== "string") {
    return NextResponse.json(
      { message: "GitHub username is required" },
      { status: 400 },
    );
  }

  const username = githubUsername.trim();
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
    return NextResponse.json(
      { message: "Invalid GitHub username" },
      { status: 400 },
    );
  }

  try {
    const result = await syncGitHubStars(userId, username);

    return NextResponse.json({
      message: result.added > 0
        ? `Synced ${result.added} new starred repos`
        : "Stars are already up to date",
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 },
    );
  }
}
