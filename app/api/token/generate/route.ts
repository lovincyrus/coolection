import { auth, currentUser } from "@clerk/nextjs/server";
import crypto from "crypto";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

const MAX_TOKENS = 5;

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let name = "";
  try {
    const body = await req.json();
    if (typeof body.name === "string") {
      name = body.name.trim().slice(0, 64);
    }
  } catch {
    // No body or invalid JSON — name stays ""
  }

  const raw = crypto.randomBytes(32).toString("base64url");
  const token = `coolection_${raw}`;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const user = await currentUser();

    const id = await prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: user?.emailAddresses[0]?.emailAddress ?? "",
          firstName: user?.firstName,
          lastName: user?.lastName,
          imageUrl: user?.imageUrl,
        },
      });

      const count = await tx.apiToken.count({ where: { userId } });
      if (count >= MAX_TOKENS) {
        throw new Error("TOKEN_LIMIT");
      }

      const created = await tx.apiToken.create({
        data: { userId, tokenHash, name },
      });
      return created.id;
    });

    return NextResponse.json({ token, id, name });
  } catch (error) {
    if (error instanceof Error && error.message === "TOKEN_LIMIT") {
      return NextResponse.json(
        { message: `Token limit reached (max ${MAX_TOKENS})` },
        { status: 409 },
      );
    }
    return NextResponse.json(
      {
        message: "Failed to generate token",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
