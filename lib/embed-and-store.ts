import { generateLocalEmbedding } from "./local-embedding";
import prisma from "./prisma";

export async function embedItem(itemId: string, title: string, description: string | null) {
  const embedding = await generateLocalEmbedding(`${title} ${description ?? ""}`);
  await prisma.$executeRaw`
    UPDATE item SET embedding = ${JSON.stringify(embedding)}::vector WHERE id = ${itemId}
  `;
  return embedding;
}

export async function embedList(listId: string, name: string, description: string | null) {
  const embedding = await generateLocalEmbedding(`${name} ${description ?? ""}`);
  await prisma.$executeRaw`
    UPDATE list SET embedding = ${JSON.stringify(embedding)}::vector WHERE id = ${listId}
  `;
  return embedding;
}
