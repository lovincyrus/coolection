import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { count } = await prisma.apiToken.deleteMany({
    where: { id: params.id, userId },
  });

  if (count === 0) {
    return NextResponse.json({ message: "Token not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Token revoked" });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
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
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  const { count } = await prisma.apiToken.updateMany({
    where: { id: params.id, userId },
    data: { name },
  });

  if (count === 0) {
    return NextResponse.json({ message: "Token not found" }, { status: 404 });
  }

  return NextResponse.json({ id: params.id, name });
}
