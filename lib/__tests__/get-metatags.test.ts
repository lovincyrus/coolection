import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node-fetch", () => ({
  default: vi.fn(),
}));

/* eslint-disable import/first, simple-import-sort/imports */
import fetch from "node-fetch";
import { getMetatags } from "../get-metatags";
/* eslint-enable import/first, simple-import-sort/imports */

const mockFetch = vi.mocked(fetch);

function htmlResponse(html: string) {
  return { text: () => Promise.resolve(html) } as any;
}

describe("getMetatags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extracts og:title and og:description", async () => {
    mockFetch.mockResolvedValue(
      htmlResponse(`
        <html><head>
          <meta property="og:title" content="My Article" />
          <meta property="og:description" content="A great article" />
        </head></html>
      `),
    );

    const result = await getMetatags("https://example.com/article");

    expect(result.title).toBe("My Article");
    expect(result.description).toBe("A great article");
  });

  it("falls back to <title> when og:title is missing", async () => {
    mockFetch.mockResolvedValue(
      htmlResponse(`<html><head><title>Page Title</title></head></html>`),
    );

    const result = await getMetatags("https://example.com/page");

    expect(result.title).toBe("Page Title");
  });

  it("returns fallback title from URL when fetch throws (e.g. SSL error)", async () => {
    mockFetch.mockRejectedValue(
      new Error("unable to verify the first certificate"),
    );

    const result = await getMetatags(
      "https://wtfeconomy.com/work-on-stuff-that-matters-first-principles-335646af32b9",
    );

    expect(result.title).toBe(
      "work on stuff that matters first principles 335646af32b9",
    );
    expect(result.description).toBeUndefined();
  });

  it("returns fallback title from URL when fetch times out", async () => {
    mockFetch.mockRejectedValue(new Error("network timeout"));

    const result = await getMetatags("https://example.com/my-post");

    expect(result.title).toBe("my post");
    expect(result.description).toBeUndefined();
  });

  it("returns fallback title when page has a bot-protection title", async () => {
    mockFetch.mockResolvedValue(
      htmlResponse(`<html><head><title>Just a moment...</title></head></html>`),
    );

    const result = await getMetatags("https://example.com/protected-page");

    expect(result.title).toBe("protected page");
  });
});
