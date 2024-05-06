import prisma from "@/lib/prisma";

export async function checkDuplicateItem(
  url: string,
  userId: string
): Promise<boolean> {
  const existingItem = await prisma.item.findFirst({
    where: {
      url: url,
      userId: userId,
    },
  });

  return !!existingItem;
}
