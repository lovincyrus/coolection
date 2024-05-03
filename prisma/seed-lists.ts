import prisma from "../lib/prisma";

if (!process.env.DATABASE_URL) {
  throw new Error("process.env.DATABASE_URL is not defined. Please set it.");
}

async function main() {
  // Check if the list already exists
  const existingList = await prisma.list.findFirst({
    where: {
      name: "My Favorite Items",
    },
  });

  if (existingList) {
    console.log(
      `List 'My Favorite Items' already exists with id: ${existingList.id}`
    );
    return;
  }

  // If the list does not exist, create it
  const newList = await prisma.list.create({
    data: {
      name: "My Favorite Items",
      description: "A list of my favorite items.",
    },
  });

  console.log(`Created new list with id: ${newList.id}`);
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
