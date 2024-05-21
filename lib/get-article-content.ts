import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import { parse } from "node-html-parser";

export async function getArticleContent(url: string) {
  const response = await fetch(url);
  const html = await response.text();

  const document = parse(html);

  const dom = new JSDOM(document.toString());

  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  return {
    title: article?.title ?? "",
    author: article?.byline ?? "",
    textContent: article?.textContent ?? "",
    excerpt: article?.excerpt ?? "",
    length: article?.length ?? 0,
    siteName: article?.siteName ?? "",
  };
}
