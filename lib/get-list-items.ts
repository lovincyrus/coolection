import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

export async function getListItems(listId: string) {
  const { userId } = auth();

  if (!userId) return [];

  try {
    const listWithItems = await prisma.list.findUnique({
      where: {
        id: listId,
        userId: userId,
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    const items =
      listWithItems?.items
        .filter((itemList) => itemList.item.deletedAt === null)
        .map((itemList) => itemList.item) ?? [];

    return items;
  } catch {
    return [];
  }
}
