"use server";

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { resolveUserId } from "@/lib/resolve-user-id";

export async function GET() {
  const userId = await resolveUserId();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const syncState = await prisma.gitHubStarsSync.findUnique({
    where: { userId },
    select: {
      githubUsername: true,
      lastSyncedAt: true,
    },
  });

  return NextResponse.json({
    configured: !!syncState,
    githubUsername: syncState?.githubUsername ?? null,
    lastSyncedAt: syncState?.lastSyncedAt?.toISOString() ?? null,
  });
}
