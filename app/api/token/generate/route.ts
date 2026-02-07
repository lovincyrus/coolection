import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST() {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const raw = crypto.randomBytes(32).toString("base64url");
  const token = `coolection_${raw}`;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  try {
    await prisma.apiToken.upsert({
      where: { userId },
      update: { tokenHash },
      create: { userId, tokenHash },
    });

    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to generate token",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
