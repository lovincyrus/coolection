import { ItemType } from "@/app/types/coolection";
import { enrichUrl } from "@/lib/enrich-url";
import { getMetatags } from "@/lib/get-metatags";
import prisma from "@/lib/prisma";

export async function addWebsite(url: string, userId: string) {
  const { title, description } = await getMetatags(url);

  // Enrich URL with context (creator, org, entities) - non-blocking
  let context: string | undefined;
  if (title) {
    try {
      const enriched = await enrichUrl(title, description);
      context = enriched.formatted;
    } catch (error) {
      console.warn("URL enrichment failed:", error);
      // Non-critical: continue without enrichment
    }
  }

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
    context,
    // content: replaceNewlinesWithSpaces(textContent),
    // metadata,
    // embedding: JSON.stringify(generatedEmbedding),
  });

  const newCoolection = await prisma.item.create({
    data: {
      url,
      title: title ?? "Untitled",
      description: description,
      context,
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
