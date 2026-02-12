import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies before importing the route
vi.mock("@/lib/resolve-user-id", () => ({
  resolveUserId: vi.fn(),
}));

vi.mock("@/lib/check-duplicate-item", () => ({
  checkDuplicateItem: vi.fn(),
}));

vi.mock("@/lib/add-website", () => ({
  addWebsite: vi.fn(),
}));

vi.mock("@/lib/add-twitter-post-or-bookmark", () => ({
  addTwitterPostOrBookmark: vi.fn(),
}));

import { addTwitterPostOrBookmark } from "@/lib/add-twitter-post-or-bookmark";
import { addWebsite } from "@/lib/add-website";
import { checkDuplicateItem } from "@/lib/check-duplicate-item";
import { resolveUserId } from "@/lib/resolve-user-id";

import { POST } from "../route";

const mockResolveUserId = vi.mocked(resolveUserId);
const mockCheckDuplicate = vi.mocked(checkDuplicateItem);
const mockAddWebsite = vi.mocked(addWebsite);
const mockAddTwitter = vi.mocked(addTwitterPostOrBookmark);

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/item/bulk-create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/item/bulk-create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveUserId.mockResolvedValue("user-123");
    mockCheckDuplicate.mockResolvedValue(false);
    mockAddWebsite.mockResolvedValue({ id: "item-1" } as any);
    mockAddTwitter.mockResolvedValue({ id: "item-2" } as any);
  });

  it("returns 401 when not authenticated", async () => {
    mockResolveUserId.mockResolvedValue(null);

    const res = await POST(makeRequest({ urls: ["https://example.com"] }));

    expect(res.status).toBe(401);
  });

  it("returns 400 when urls is not an array", async () => {
    const res = await POST(makeRequest({ urls: "not-an-array" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("urls array is required");
  });

  it("returns 400 when urls is empty", async () => {
    const res = await POST(makeRequest({ urls: [] }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe("urls array is required");
  });

  it("returns 400 when too many urls", async () => {
    const urls = Array.from({ length: 101 }, (_, i) => `https://example.com/${i}`);
    const res = await POST(makeRequest({ urls }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toContain("Maximum 100");
  });

  it("creates website items for regular URLs", async () => {
    const res = await POST(makeRequest({
      urls: ["https://example.com", "https://other.com"],
    }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.created).toBe(2);
    expect(data.duplicates).toBe(0);
    expect(data.failed).toBe(0);
    expect(mockAddWebsite).toHaveBeenCalledTimes(2);
  });

  it("routes twitter URLs to addTwitterPostOrBookmark", async () => {
    const res = await POST(makeRequest({
      urls: ["https://x.com/rauchg/status/1784694622566187100"],
    }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.created).toBe(1);
    expect(mockAddTwitter).toHaveBeenCalledTimes(1);
    expect(mockAddWebsite).not.toHaveBeenCalled();
  });

  it("skips duplicate URLs", async () => {
    mockCheckDuplicate
      .mockResolvedValueOnce(true)  // first is duplicate
      .mockResolvedValueOnce(false); // second is new

    const res = await POST(makeRequest({
      urls: ["https://example.com/old", "https://example.com/new"],
    }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.created).toBe(1);
    expect(data.duplicates).toBe(1);
  });

  it("handles mixed results (created, duplicate, failed)", async () => {
    mockCheckDuplicate
      .mockResolvedValueOnce(false) // will succeed
      .mockResolvedValueOnce(true)  // duplicate
      .mockResolvedValueOnce(false); // will fail

    mockAddWebsite
      .mockResolvedValueOnce({ id: "item-1" } as any)
      .mockRejectedValueOnce(new Error("Network error"));

    const res = await POST(makeRequest({
      urls: [
        "https://example.com/good",
        "https://example.com/dupe",
        "https://example.com/bad",
      ],
    }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.created).toBe(1);
    expect(data.duplicates).toBe(1);
    expect(data.failed).toBe(1);
    expect(data.results).toHaveLength(3);
    expect(data.results[0].status).toBe("created");
    expect(data.results[1].status).toBe("duplicate");
    expect(data.results[2].status).toBe("failed");
  });

  it("handles invalid URL entries in the array", async () => {
    const res = await POST(makeRequest({
      urls: [null, "", "https://example.com"],
    }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.failed).toBeGreaterThanOrEqual(1);
    expect(data.results.some((r: any) => r.status === "created")).toBe(true);
  });
});
