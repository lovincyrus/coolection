import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/resolve-user-id", () => ({
  resolveUserId: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    item: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

/* eslint-disable import/first */
import prisma from "@/lib/prisma";
import { resolveUserId } from "@/lib/resolve-user-id";

import { PUT } from "../route";
/* eslint-enable import/first */

const mockResolveUserId = vi.mocked(resolveUserId);
const mockFindUnique = vi.mocked(prisma.item.findUnique);
const mockUpdate = vi.mocked(prisma.item.update);

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/item/archive", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PUT /api/item/archive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveUserId.mockResolvedValue("user-123");
  });

  it("returns 401 when not authenticated", async () => {
    mockResolveUserId.mockResolvedValue(null);

    const res = await PUT(makeRequest({ item_id: "item-1" }));

    expect(res.status).toBe(401);
  });

  it("returns 400 when item_id is missing", async () => {
    const res = await PUT(makeRequest({}));

    expect(res.status).toBe(400);
  });

  it("returns 404 when item not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await PUT(makeRequest({ item_id: "nonexistent" }));

    expect(res.status).toBe(404);
  });

  it("returns 403 when item belongs to another user", async () => {
    mockFindUnique.mockResolvedValue({ id: "item-1", userId: "other-user" } as any);

    const res = await PUT(makeRequest({ item_id: "item-1" }));

    expect(res.status).toBe(403);
  });

  it("archives item successfully", async () => {
    mockFindUnique.mockResolvedValue({ id: "item-1", userId: "user-123" } as any);
    mockUpdate.mockResolvedValue({} as any);

    const res = await PUT(makeRequest({ item_id: "item-1" }));

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "item-1" },
        data: expect.objectContaining({ isDeleted: true }),
      }),
    );
  });
});
