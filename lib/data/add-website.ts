import { ItemType } from "@/app/types/coolection";
import { getArticleContent } from "@/lib/get-article-content";
import { getMetatags } from "@/lib/get-metatags";
import prisma from "@/lib/prisma";

import { replaceNewlinesWithSpaces } from "../utils";

export async function addWebsite(url: string, userId: string) {
  const { title, description } = await getMetatags(url);
  const {
    title: articleTitle,
    author,
    textContent,
    excerpt,
    length,
    siteName,
  } = await getArticleContent(url);

  // const generatedEmbedding = await generateEmbedding(
  //   (title ?? "") + " " + (description ?? "")
  // );

  const metadata =
    textContent !== null
      ? {
          title: articleTitle,
          author: author,
          excerpt: excerpt,
          length: length,
          siteName: siteName,
        }
      : {};

  console.log("adding to collection: ", {
    url,
    title,
    description,
    content: replaceNewlinesWithSpaces(textContent),
    metadata,
    // embedding: JSON.stringify(generatedEmbedding),
  });

  const newCoolection = await prisma.item.create({
    data: {
      url,
      title: title ?? articleTitle ?? "Untitled",
      description: description ?? excerpt,
      type: ItemType._WEBSITE,
      content: replaceNewlinesWithSpaces(textContent),
      metadata,
      // See: https://github.com/prisma/prisma/discussions/18220#discussioncomment-5266901
      // embedding: JSON.stringify(embedding),
      userId: userId,
    },
  });

  // await prisma.$executeRaw`
  //   UPDATE item
  //   SET embedding = ${JSON.stringify(generatedEmbedding)}::vector
  //   WHERE id = ${newCoolection.id}
  // `;

  console.log(
    `Added new coolection with title: ${JSON.stringify(newCoolection, null, 2)}`,
  );

  return newCoolection;
}
