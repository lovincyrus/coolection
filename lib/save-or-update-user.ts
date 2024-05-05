import prisma from "@/lib/prisma";

export async function saveOrUpdateUser(userData) {
  const {
    userId,
    email,
    firstName,
    lastName,
    profileImageUrl,
    createdAt,
    updatedAt,
  } = userData;
  try {
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        email: email,
        firstName: firstName,
        lastName: lastName,
        imageUrl: profileImageUrl,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      },
      create: {
        id: userId,
        email: email,
        firstName: firstName,
        lastName: lastName,
        imageUrl: profileImageUrl,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      },
    });
    return user;
  } catch (error) {
    console.error("Error saving user:", error);
    throw error;
  }
}
