import prisma from "@/lib/prisma";

export async function getListById(id: string) {
  const list = await prisma.list.findUnique({
    where: {
      id,
    },
  });

  return list;
}
