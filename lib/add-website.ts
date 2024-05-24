import { ItemType } from "@/app/types/coolection";
import { getMetatags } from "@/lib/get-metatags";
import prisma from "@/lib/prisma";

export async function addWebsite(url: string, userId: string) {
  const { title, description } = await getMetatags(url);

  // TODO: Uncomment this when the getArticleContent function is implemented
  // const {
  //   title: articleTitle,
  //   author,
  //   textContent,
  //   excerpt,
  //   length,
  //   siteName,
  // } = await getArticleContent(url);

  // const generatedEmbedding = await generateEmbedding(
  //   (title ?? "") + " " + (description ?? "")
  // );

  // const metadata =
  //   textContent !== null
  //     ? {
  //         title: articleTitle,
  //         author: author,
  //         excerpt: excerpt,
  //         length: length,
  //         siteName: siteName,
  //       }
  //     : {};

  console.log("adding to collection: ", {
    url,
    title,
    description,
    // content: replaceNewlinesWithSpaces(textContent),
    // metadata,
    // embedding: JSON.stringify(generatedEmbedding),
  });

  const newCoolection = await prisma.item.create({
    data: {
      url,
      title: title ?? "Untitled",
      description: description,
      type: ItemType._WEBSITE,
      // content: replaceNewlinesWithSpaces(textContent),
      // metadata,
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
