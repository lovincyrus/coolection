"use server";

import type { NextApiRequest, NextApiResponse } from "next";

import { addToCollection } from "../../../lib/crud";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const body = await req.json();
  const { link } = body;

  try {
    await addToCollection(link);
    // FIXME: TypeError: res.status is not a function
    res.status(200).json({ message: "Link added successfully" });
  } catch (error) {
    if (error instanceof Error) {
      // FIXME: TypeError: res.status is not a function
      res.status(500).json({
        message: "Failed to add the link",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
