import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { headers } from "next/headers";

import prisma from "@/lib/prisma";

export async function resolveUserId(): Promise<string | null> {
  const authorization = headers().get("authorization");

  if (authorization?.startsWith("Bearer coolection_")) {
    const token = authorization.substring(7);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const apiToken = await prisma.apiToken.findUnique({
      where: { tokenHash },
      select: { userId: true },
    });
    return apiToken?.userId ?? null;
  }

  return auth().userId;
}
