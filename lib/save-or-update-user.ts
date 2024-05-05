import prisma from "@/lib/prisma";

interface UserData {
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export async function saveOrUpdateUser(userData: UserData) {
  const { userId, email, firstName, lastName, imageUrl, createdAt, updatedAt } =
    userData;
  try {
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        email: email,
        firstName: firstName,
        lastName: lastName,
        imageUrl: imageUrl,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      },
      create: {
        id: userId,
        email: email,
        firstName: firstName,
        lastName: lastName,
        imageUrl: imageUrl,
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
