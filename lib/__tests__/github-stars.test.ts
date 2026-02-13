import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  gitHubStarsSync: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  item: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ default: mockPrisma }));

/* eslint-disable import/first */
import { syncGitHubStars } from "../github-stars";
/* eslint-enable import/first */

function makeStarResponse(
  fullName: string,
  htmlUrl: string,
  starredAt: string,
  overrides: Record<string, any> = {},
) {
  return {
    starred_at: starredAt,
    repo: {
      full_name: fullName,
      html_url: htmlUrl,
      description: `Description of ${fullName}`,
      owner: { avatar_url: `https://github.com/${fullName.split("/")[0]}.png` },
      topics: ["test"],
      language: "TypeScript",
      stargazers_count: 100,
      ...overrides,
    },
  };
}

function mockFetchResponse(
  stars: any[],
  status = 200,
  headers: Record<string, string> = {},
) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
    json: async () => stars,
  };
}

describe("syncGitHubStars", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPrisma.gitHubStarsSync.findUnique.mockReset();
    mockPrisma.gitHubStarsSync.upsert.mockReset();
    mockPrisma.item.findMany.mockReset();
    mockPrisma.item.create.mockReset();

    mockPrisma.gitHubStarsSync.findUnique.mockResolvedValue(null);
    mockPrisma.gitHubStarsSync.upsert.mockResolvedValue({});
    mockPrisma.item.findMany.mockResolvedValue([]);
    mockPrisma.item.create.mockResolvedValue({});
  });

  it("fetches stars and creates items on first sync", async () => {
    const stars = [
      makeStarResponse("user/repo1", "https://github.com/user/repo1", "2024-01-01T00:00:00Z"),
      makeStarResponse("user/repo2", "https://github.com/user/repo2", "2024-01-02T00:00:00Z"),
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(mockFetchResponse(stars, 200, { etag: '"abc123"' })),
    );

    const result = await syncGitHubStars("user-1", "testuser");

    expect(result.added).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.total).toBe(2);
    expect(mockPrisma.item.create).toHaveBeenCalledTimes(2);
    expect(mockPrisma.item.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        url: "https://github.com/user/repo1",
        title: "user/repo1",
        type: "github_star",
        userId: "user-1",
      }),
    });
    expect(mockPrisma.gitHubStarsSync.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        create: expect.objectContaining({
          githubUsername: "testuser",
          etag: '"abc123"',
        }),
      }),
    );
  });

  it("returns early when ETag matches (304 Not Modified)", async () => {
    mockPrisma.gitHubStarsSync.findUnique.mockResolvedValue({
      etag: '"abc123"',
      lastSyncedAt: new Date(),
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(mockFetchResponse([], 304)),
    );

    const result = await syncGitHubStars("user-1", "testuser");

    expect(result.added).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.total).toBe(0);
    expect(mockPrisma.item.create).not.toHaveBeenCalled();
    expect(mockPrisma.gitHubStarsSync.upsert).not.toHaveBeenCalled();
  });

  it("sends If-None-Match header when ETag exists", async () => {
    mockPrisma.gitHubStarsSync.findUnique.mockResolvedValue({
      etag: '"abc123"',
      lastSyncedAt: new Date(),
    });

    const fetchMock = vi.fn().mockResolvedValueOnce(mockFetchResponse([], 304));
    vi.stubGlobal("fetch", fetchMock);

    await syncGitHubStars("user-1", "testuser");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("users/testuser/starred"),
      expect.objectContaining({
        headers: expect.objectContaining({
          "If-None-Match": '"abc123"',
        }),
      }),
    );
  });

  it("skips duplicate URLs", async () => {
    const stars = [
      makeStarResponse("user/repo1", "https://github.com/user/repo1", "2024-01-01T00:00:00Z"),
      makeStarResponse("user/repo2", "https://github.com/user/repo2", "2024-01-02T00:00:00Z"),
    ];

    mockPrisma.item.findMany.mockResolvedValue([
      { url: "https://github.com/user/repo1" },
    ]);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(mockFetchResponse(stars, 200, { etag: '"new"' })),
    );

    const result = await syncGitHubStars("user-1", "testuser");

    expect(result.added).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.total).toBe(2);
    expect(mockPrisma.item.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.item.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        url: "https://github.com/user/repo2",
      }),
    });
  });

  it("throws on GitHub user not found (404)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(mockFetchResponse([], 404)),
    );

    await expect(syncGitHubStars("user-1", "nonexistent")).rejects.toThrow(
      'GitHub user "nonexistent" not found',
    );
  });

  it("throws on rate limit exceeded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        mockFetchResponse([], 403, {
          "x-ratelimit-remaining": "0",
          "x-ratelimit-reset": String(Math.floor(Date.now() / 1000) + 3600),
        }),
      ),
    );

    await expect(syncGitHubStars("user-1", "testuser")).rejects.toThrow(
      "GitHub API rate limit exceeded",
    );
  });

  it("stores metadata including language and star count", async () => {
    const stars = [
      makeStarResponse("user/repo1", "https://github.com/user/repo1", "2024-06-15T10:30:00Z", {
        language: "Rust",
        stargazers_count: 5000,
        topics: ["cli", "rust"],
      }),
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(mockFetchResponse(stars, 200, { etag: '"v1"' })),
    );

    await syncGitHubStars("user-1", "testuser");

    expect(mockPrisma.item.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        metadata: expect.objectContaining({
          language: "Rust",
          stars: 5000,
          topics: ["cli", "rust"],
          starred_at: "2024-06-15T10:30:00Z",
        }),
      }),
    });
  });

  it("uses starred_at as createdAt for proper ordering", async () => {
    const stars = [
      makeStarResponse("user/repo1", "https://github.com/user/repo1", "2024-03-15T12:00:00Z"),
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(mockFetchResponse(stars, 200, { etag: '"v1"' })),
    );

    await syncGitHubStars("user-1", "testuser");

    expect(mockPrisma.item.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        createdAt: new Date("2024-03-15T12:00:00Z"),
      }),
    });
  });
});
