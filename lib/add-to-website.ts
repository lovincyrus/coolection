import { ItemType } from "@/app/types/coolection";
import { getMetatags } from "@/lib//get-metatags";
import { generateEmbedding } from "@/lib/generate-embedding";
import prisma from "@/lib/prisma";

export async function addToWebsite(url: string, user_id: string) {
  const { title, description } = await getMetatags(url);
  const generatedEmbedding = await generateEmbedding(
    (title ?? "") + " " + (description ?? "")
  );

  console.log("adding to collection: ", {
    url,
    title,
    description,
    embedding: JSON.stringify(generatedEmbedding),
  });

  const newCoolection = await prisma.item.create({
    data: {
      url,
      title: title || "",
      description: description || "",
      type: ItemType._WEBSITE,
      // See: https://github.com/prisma/prisma/discussions/18220#discussioncomment-5266901
      // embedding: JSON.stringify(embedding),
      userId: user_id,
    },
  });

  await prisma.$executeRaw`
    UPDATE item
    SET embedding = ${JSON.stringify(generatedEmbedding)}::vector
    WHERE id = ${newCoolection.id}
  `;

  console.log(
    `Added new coolection with title: ${JSON.stringify(newCoolection, null, 2)}`
  );

  return newCoolection;
}
