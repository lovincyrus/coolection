import prisma from "./prisma";

export async function checkUserExistsById(userId: string) {
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  return !!existingUser;
}
