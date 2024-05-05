import { empty } from "uuidv4";

import prisma from "../lib/prisma";

if (!process.env.DATABASE_URL) {
  throw new Error("process.env.DATABASE_URL is not defined. Please set it.");
}

async function main() {
  const existingUser = await prisma.user.findFirst({
    where: {
      id: empty(),
    },
  });

  if (existingUser) {
    console.log(`User 'Bacon Egg' already exists with id: ${existingUser.id}`);
    return;
  }

  const newUser = await prisma.user.create({
    data: {
      id: empty(),
      email: "test@gmail.com",
      firstName: "Bacon",
      lastName: "Egg",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(`Created new user with id: ${newUser.id}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
