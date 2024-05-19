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

  const duplicateUrls = await prisma.item.groupBy({
    by: ['url'],
    _count: {
      url: true,
    },
    having: {
      url: {
        _count: {
          gt: 1,
        },
      },
    },
  });
  
  console.log("Duplicate URLs:", duplicateUrls);
  
  for (const { url } of duplicateUrls) {
    console.log(`Setting isDeleted to true for URL: ${url}`);
    await prisma.item.updateMany({
      where: {
        url,
      },
      data: {
        isDeleted: true,
      },
    });
  }
  
  console.log("All duplicate URLs have been marked as deleted.");
  
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
