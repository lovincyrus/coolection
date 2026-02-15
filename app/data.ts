// See: https://github.com/vercel/swr/issues/1906

import { empty } from "@/lib/constants";

// See: https://x.com/shuding_/status/1794462595719848408
export function getAllLists() {
  // const url = new URL(
  //   "/api/lists",
  //   process.env.NODE_ENV === "development"
  //     ? "http://localhost:3000"
  //     : "https://coolection.co",
  // );

  // fetcher(url.href);

  return [
    {
      id: empty(),
      name: "",
    },
  ];
}

export function getItems(_page: number, _limit: number) {
  // const url = new URL(
  //   `/api/items?page=${page}&limit=${limit}`,
  //   process.env.NODE_ENV === "development"
  //     ? "http://localhost:3000"
  //     : "https://coolection.co",
  // );

  // fetcher(url.href);

  return [
    [
      {
        id: empty(),
        url: "",
        title: "",
        description: "",
        content: null,
        image: null,
        createdAt: "",
        updatedAt: "",
        deletedAt: null,
        isDeleted: false,
        type: "website",
        metadata: null,
        userId: empty(),
      },
    ],
  ];
}
