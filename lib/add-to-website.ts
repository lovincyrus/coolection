import { getMetatags } from "@/lib//get-metatags";
import { generateEmbedding } from "@/lib/generate-embedding";
import prisma from "@/lib/prisma";

export async function addToCollection(url: string) {
  const { title, description } = await getMetatags(url);
  const generatedEmbedding = await generateEmbedding(title + " " + description);

  console.log("adding to collection: ", {
    url,
    title,
    description,
    embedding: JSON.stringify(generatedEmbedding),
  });

  const newCoolection = await prisma.website.create({
    data: {
      url,
      title: title || "Untitled",
      description: description || "Untitled",
      // See: https://github.com/prisma/prisma/discussions/18220#discussioncomment-5266901
      // embedding: JSON.stringify(embedding),
    },
  });

  await prisma.$executeRaw`
    UPDATE website
    SET embedding = ${JSON.stringify(generatedEmbedding)}::vector
    WHERE id = ${newCoolection.id}
  `;

  console.log(
    `Added new coolection with title: ${JSON.stringify(newCoolection, null, 2)}`
  );

  return newCoolection;
}
