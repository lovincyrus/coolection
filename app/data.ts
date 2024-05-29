import { empty } from "uuidv4";

// See: https://github.com/vercel/swr/issues/1906
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
        createdAt: "2024-05-28T16:52:33.194Z",
        updatedAt: "2024-05-28T16:52:33.194Z",
        deletedAt: null,
        isDeleted: false,
        type: "website",
        metadata: null,
        userId: empty(),
      },
    ],
    [
      {
        id: empty(),
        url: "",
        title: "",
        description: "",
        content: null,
        image: null,
        createdAt: "2024-05-28T16:52:33.194Z",
        updatedAt: "2024-05-28T16:52:33.194Z",
        deletedAt: null,
        isDeleted: false,
        type: "website",
        metadata: null,
        userId: empty(),
      },
    ],
  ];
}
