import { generateEmbedding } from "@/lib/generate-embedding";
import prisma from "@/lib/prisma";

import { getTweet } from "./get-tweet";

// https://twitter.com/i/bookmarks?post_id=1784694622566187100
// https://twitter.com/rauchg/status/1784694622566187100
function getTweetIdFromUrl(url: string): string | null {
  const urlParts = url.split("/");
  const potentialId = urlParts[urlParts.length - 1];

  // Check if the potential ID is a number (all tweet IDs are numbers)
  if (!isNaN(Number(potentialId))) {
    return potentialId;
  }

  // If the potential ID is not a number, check if the URL is a bookmark URL
  const bookmarkPostIdMatch = url.match(/post_id=(\d+)/);
  if (bookmarkPostIdMatch) {
    return bookmarkPostIdMatch[1];
  }

  // If the URL is neither a regular tweet URL nor a bookmark URL, return null
  return null;
}

export async function addToTweetTable(twitterUrl: string) {
  const tweetID = getTweetIdFromUrl(twitterUrl);

  const tweetContent = await getTweet(tweetID);

  const generatedEmbedding = await generateEmbedding(
    tweetContent.text.replace(/\n/g, " ")
  );

  // console.log("adding to tweet table: ", tweetContent);

  console.log("adding to tweet table: ", {
    id: tweetID,
    name: tweetContent.user.name,
    content: tweetContent.text.replace(/\n/g, ""),
    url: twitterUrl,
  });

  const newTweet = await prisma.tweet.create({
    data: {
      id: tweetID,
      name: tweetContent.user.name,
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
