import cheerio from "cheerio";
import fetch from "node-fetch";

import { isTwitterAccountUrl } from "./url";

function parseTwitterScreenName(url: string) {
  const match = url.match(/x.com\/([a-zA-Z0-9_]+)/);
  return match ? match[1] : null;
}

export async function getMetatags(url: string) {
  const response = await fetch(url);
  const data = await response.text();
  const $ = cheerio.load(data);
  const headTitle = $("head > title").text();
  const title = $("title").text();
  const ogTitle = $("meta[property='og:title']").attr("content");
  const ogSiteName = $("meta[property='og:site_name']").attr("content");
  const ogDescription = $('meta[property="og:description"]').attr("content");
  const description = $('meta[name="description"]').attr("content");

  if (isTwitterAccountUrl(url)) {
    const screenName = parseTwitterScreenName(url);
    return {
      title: screenName,
    };
  }

  return {
    title: ogTitle || title || headTitle || ogSiteName,
    description: ogDescription || description,
  };
}
