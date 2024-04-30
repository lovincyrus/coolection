import { generateEmbedding } from "@/lib/generate-embedding";

import prisma from "../lib/prisma";

export async function addToCollection(link: string) {
  const title = "Extracted Title from " + link;
  const description = "Description based on link";

  const embedding = await generateEmbedding(title);
  // await new Promise((r) => setTimeout(r, 500)); // Wait 500ms between requests to not overwhelm the API

  console.log("adding to collection: ", {
    link,
    title,
    description,
    embedding: JSON.stringify(embedding),
  });

  const newCoolection = await prisma.coolection.create({
    data: {
      url: link,
      title,
      description,
      // See: https://github.com/prisma/prisma/discussions/18220#discussioncomment-5266901
      // embedding: JSON.stringify(embedding),
    },
  });

  // Add the embedding
  await prisma.$executeRaw`
    UPDATE coolection
    SET embedding = ${JSON.stringify(embedding)}::vector
    WHERE id = ${newCoolection.id}
  `;

  console.log(
    `Added new coolection with title: ${JSON.stringify(newCoolection, null, 2)}`
  );

  return newCoolection;
}
