import cheerio from "cheerio";
import fetch from "node-fetch";

export async function getMetatags(url: string) {
  const response = await fetch(url);
  const data = await response.text();
  const $ = cheerio.load(data);
  const title = $("head > title").text();
  const ogDescription = $('meta[property="og:description"]').attr("content");
  const metaDescription = $('meta[name="description"]').attr("content");

  return {
    title,
    description: ogDescription ?? metaDescription,
  };
}
