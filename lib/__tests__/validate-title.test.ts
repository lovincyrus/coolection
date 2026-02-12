import { describe, expect, it } from "vitest";

import { isValidTitle, titleFromUrl } from "../validate-title";

describe("isValidTitle", () => {
  it("rejects null and undefined", () => {
    expect(isValidTitle(null)).toBe(false);
    expect(isValidTitle(undefined)).toBe(false);
  });

  it("rejects empty and whitespace-only strings", () => {
    expect(isValidTitle("")).toBe(false);
    expect(isValidTitle("   ")).toBe(false);
  });

  it("rejects Cloudflare challenge titles", () => {
    expect(isValidTitle("Just a moment...")).toBe(false);
    expect(isValidTitle("Attention Required!")).toBe(false);
    expect(isValidTitle("Checking your browser...")).toBe(false);
  });

  it("rejects other bot-protection titles", () => {
    expect(isValidTitle("Access Denied")).toBe(false);
    expect(isValidTitle("Please wait...")).toBe(false);
    expect(isValidTitle("403 Forbidden")).toBe(false);
    expect(isValidTitle("Security Check")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isValidTitle("JUST A MOMENT...")).toBe(false);
    expect(isValidTitle("just a moment...")).toBe(false);
    expect(isValidTitle("Just A Moment...")).toBe(false);
  });

  it("accepts legitimate titles", () => {
    expect(isValidTitle("Julian Shapiro")).toBe(true);
    expect(isValidTitle("My Blog Post - Medium")).toBe(true);
    expect(isValidTitle("Cloudflare AI Playground")).toBe(true);
    expect(isValidTitle("Next Chapter")).toBe(true);
  });
});

describe("titleFromUrl", () => {
  it("returns hostname for root URLs", () => {
    expect(titleFromUrl("https://www.julian.com")).toBe("julian.com");
    expect(titleFromUrl("https://playground.ai.cloudflare.com/")).toBe(
      "playground.ai.cloudflare.com",
    );
  });

  it("strips www prefix", () => {
    expect(titleFromUrl("https://www.example.com")).toBe("example.com");
  });

  it("returns last path segment for URLs with paths", () => {
    expect(titleFromUrl("https://example.com/blog/my-post")).toBe("my post");
    expect(titleFromUrl("https://medium.com/@user/next-chapter-37f95c4bdd91")).toBe(
      "next chapter 37f95c4bdd91",
    );
  });

  it("decodes URI-encoded path segments", () => {
    expect(titleFromUrl("https://example.com/hello%20world")).toBe("hello world");
  });

  it("replaces dashes and underscores with spaces", () => {
    expect(titleFromUrl("https://example.com/my_cool_post")).toBe("my cool post");
    expect(titleFromUrl("https://example.com/my-cool-post")).toBe("my cool post");
  });

  it("returns undefined for invalid URLs", () => {
    expect(titleFromUrl("not-a-url")).toBeUndefined();
  });
});
