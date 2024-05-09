import prisma from "@/lib/prisma";

export async function getLatestItems(userId: string): Promise<Array<any>> {
  const latestResults = await prisma.item.findMany({
    where: {
      userId,
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return latestResults;
}