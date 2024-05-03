"use server";

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const lists = await prisma.list.findMany();
    return NextResponse.json(lists);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: "Failed to fetch lists",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
}
