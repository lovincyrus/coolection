import { ItemType } from "@/app/types/coolection";
import { enrichUrl } from "@/lib/enrich-url";
import { getMetatags } from "@/lib/get-metatags";
import prisma from "@/lib/prisma";

export async function addWebsite(url: string, userId: string) {
  const { title, description } = await getMetatags(url);

  console.log("adding to collection: ", {
    url,
    title,
    description,
  });

  // Enrich the URL with structured context (creator, org, content type, topics)
  const context = await enrichUrl(url, title ?? "", description);

  const newCoolection = await prisma.item.create({
    data: {
      url,
      title: title ?? "Untitled",
      description: description,
      type: ItemType._WEBSITE,
      context: context as any,
      userId: userId,
    },
  });

  console.log(
    `Added new coolection with title: ${JSON.stringify(newCoolection, null, 2)}`,
  );

  return newCoolection;
}
