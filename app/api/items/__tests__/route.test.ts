import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/resolve-user-id", () => ({
  resolveUserId: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    item: {
      findMany: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";
import { resolveUserId } from "@/lib/resolve-user-id";

import { GET } from "../route";

const mockResolveUserId = vi.mocked(resolveUserId);
const mockFindMany = vi.mocked(prisma.item.findMany);

function makeRequest(page = 1, limit = 20): Request {
  return new Request(`http://localhost/api/items?page=${page}&limit=${limit}`);
}

describe("GET /api/items", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveUserId.mockResolvedValue("user-123");
    mockFindMany.mockResolvedValue([]);
  });

  it("returns 401 when not authenticated", async () => {
    mockResolveUserId.mockResolvedValue(null);

    const res = await GET(makeRequest());

    expect(res.status).toBe(401);
  });

  it("returns items for authenticated user", async () => {
    const items = [{ id: "1", title: "Test", createdAt: new Date() }];
    mockFindMany.mockResolvedValue(items as any);

    const res = await GET(makeRequest(1, 10));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(items.map((i) => ({ ...i, createdAt: i.createdAt.toISOString() })));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-123", isDeleted: false },
        take: 10,
        skip: 0,
      }),
    );
  });

  it("paginates correctly", async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeRequest(3, 5));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 }),
    );
  });
});
