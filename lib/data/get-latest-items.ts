import prisma from "@/lib/prisma";

// See: https://www.prisma.io/docs/orm/prisma-client/queries/pagination#offset-pagination
export async function getLatestItems(
  userId: string,
  page: number,
  limit: number,
): Promise<Array<any>> {
  const skip = page * limit;

  const latestResults = await prisma.item.findMany({
    where: {
      userId: userId,
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: skip,
  });

  return latestResults;
}
