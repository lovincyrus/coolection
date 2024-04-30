import { generateEmbedding } from "@/lib/generate-embedding";
import prisma from "@/lib/prisma";

import { getTweet } from "./get-tweet";

export async function addToTweetTable(twitterUrl: string) {
  const urlParts = twitterUrl.split("/");
  const tweetID = urlParts[urlParts.length - 1];

  const tweetContent = await getTweet(tweetID);

  const generatedEmbedding = await generateEmbedding(
    tweetContent.text.replace(/\n/g, "")
  );

  // console.log("adding to tweet table: ", tweetContent);

  console.log("adding to tweet table: ", {
    id: tweetID,
    content: tweetContent.text.replace(/\n/g, ""),
    url: twitterUrl,
  });

  const newTweet = await prisma.tweet.create({
    data: {
      id: tweetID,
      content: tweetContent.text.replace(/\n/g, ""),
      url: twitterUrl,
    },
  });

  await prisma.$executeRaw`
    UPDATE tweet
    SET embedding = ${JSON.stringify(generatedEmbedding)}::vector
    WHERE id = ${newTweet.id}
  `;

  console.log(`Added new tweet`);

  return newTweet;
}
