import { ItemType } from "@/app/types/coolection";
import prisma from "@/lib/prisma";

import { getTweet } from "./get-tweet";

// https://twitter.com/i/bookmarks?post_id=1784694622566187100
// https://twitter.com/rauchg/status/1784694622566187100
function getTweetIdFromUrl(url: string) {
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

  return "";
}

function _replaceNewlinesWithSpaces(text: string) {
  return text.replace(/\n/g, " ");
}

function isTwitterBookmarkUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === "twitter.com" &&
      urlObj.pathname === "/i/bookmarks" &&
      urlObj.searchParams.has("post_id")
    );
  } catch {
    return false;
  }
}

export async function addToTweetTable(url: string, user_id: string) {
  const tweetID = getTweetIdFromUrl(url);

  const tweetContent = await getTweet(tweetID as string);

  // const generatedEmbedding = await generateEmbedding(
  //   String(tweetContent?.text.replace(/\n/g, " "))
  // );

  // console.log("adding to tweet table: ", tweetContent);

  // TODO: normalize https://twitter.com/i/bookmarks?post_id=1764083298840768800 to https://twitter.com/omarwasm/status/1764083298840768800
  console.log("adding to tweet table: ", {
    metadata: {
      tweet_id: tweetID,
      name: tweetContent?.user.name ?? "",
    },
    content: tweetContent?.text.replace(/\n/g, " "),
    url: isTwitterBookmarkUrl(url)
      ? `https://twitter.com/${tweetContent?.user.screen_name}/status/${tweetID}`
      : url,
    type: ItemType._TWEET,
  });

  const newTweet = await prisma.item.create({
    data: {
      title: `Tweet by ${tweetContent?.user.name}`,
      type: ItemType._TWEET,
      content: tweetContent?.text.replace(/\n/g, " ") ?? "",
      url: isTwitterBookmarkUrl(url)
        ? `https://twitter.com/${tweetContent?.user.screen_name}/status/${tweetID}`
        : url,
      metadata: {
        tweet_id: tweetID,
        name: tweetContent?.user.name ?? "",
      },
      userId: user_id,
    },
  });

  // await prisma.$executeRaw`
  //   UPDATE item
  //   SET embedding = ${JSON.stringify(generatedEmbedding)}::vector
  //   WHERE id = ${newTweet.id}
  // `;

  console.log(`Added new tweet`);

  return newTweet;
}
