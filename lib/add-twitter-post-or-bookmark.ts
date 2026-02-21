import { ItemType } from "@/app/types/coolection";
import { enrichUrl } from "@/lib/enrich-url";
import prisma from "@/lib/prisma";

import { getTweet } from "./get-tweet";

// https://twitter.com/i/bookmarks?post_id=1784694622566187100
// https://twitter.com/rauchg/status/1784694622566187100
function getTweetIdFromUrl(url: string) {
  try {
    const urlObj = new URL(url);

    // Check if the URL is a bookmark URL with post_id param
    const postId = urlObj.searchParams.get("post_id");
    if (postId) {
      return postId;
    }

    // Extract tweet ID from pathname: /user/status/1234567890
    const pathSegments = urlObj.pathname.split("/").filter(Boolean);
    const statusIndex = pathSegments.indexOf("status");
    if (statusIndex !== -1 && statusIndex + 1 < pathSegments.length) {
      return pathSegments[statusIndex + 1];
    }
  } catch {
    // Fall through
  }

  return "";
}

function isTwitterBookmarkUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === "x.com" &&
      urlObj.pathname === "/i/bookmarks" &&
      urlObj.searchParams.has("post_id")
    );
  } catch {
    return false;
  }
}

export async function addTwitterPostOrBookmark(url: string, userId: string) {
  const tweetID = getTweetIdFromUrl(url);

  const tweetContent = await getTweet(tweetID as string);

  // Enrich tweet with context - non-blocking
  let context: string | undefined;
  try {
    const authorName = tweetContent?.user.name ?? "";
    const tweetText = tweetContent?.text ?? "";
    const enriched = await enrichUrl(authorName, tweetText);
    context = enriched.formatted;
  } catch (error) {
    console.warn("Tweet enrichment failed:", error);
    // Non-critical: continue without enrichment
  }

  // const generatedEmbedding = await generateEmbedding(
  //   String(tweetContent?.text.replace(/\n/g, " "))
  // );

  // console.log("adding to tweet table: ", tweetContent);

  console.log("adding to tweet table: ", {
    content: tweetContent?.text.replace(/\n/g, " "),
    url: url,
    type: ItemType._TWEET,
    context,
    metadata: {
      tweet_id: tweetID,
      tweet_url: isTwitterBookmarkUrl(url)
        ? `https://twitter.com/${tweetContent?.user.screen_name}/status/${tweetID}`
        : url,
      name: tweetContent?.user.name ?? "",
    },
  });

  const newTweet = await prisma.item.create({
    data: {
      title: `${tweetContent?.user.name}`,
      type: ItemType._TWEET,
      content: tweetContent?.text.replace(/\n/g, " ") ?? "",
      context,
      url: url,
      metadata: {
        tweet_id: tweetID,
        tweet_url: isTwitterBookmarkUrl(url)
          ? `https://twitter.com/${tweetContent?.user.screen_name}/status/${tweetID}`
          : url,
        name: tweetContent?.user.name ?? "",
      },
      userId: userId,
    },
  });

  // await prisma.$executeRaw`
  //   UPDATE item
  //   SET embedding = ${JSON.stringify(generatedEmbedding)}::vector
  //   WHERE id = ${newTweet.id}
  // `;

  console.log(`Added new tweet: ${JSON.stringify(newTweet, null, 2)}`);

  return newTweet;
}
