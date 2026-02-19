// See: https://github.com/vercel/swr/blob/main/examples/basic-typescript/libs/fetch.ts
export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<JSON> {
  const res = await fetch(input, init);

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }

  return res.json();
}
