import prisma from "../lib/prisma";

if (!process.env.DATABASE_URL) {
  throw new Error("process.env.DATABASE_URL is not defined. Please set it.");
}

async function main() {
  // Unarchive all items
  const updatedItems = await prisma.item.updateMany({
    where: {
      isDeleted: true,
    },
    data: {
      isDeleted: false,
    },
  });

  console.log(`Unarchived ${updatedItems.count} items`);
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
