import { openai } from "./openai";

export async function generateEmbedding(_input: string) {
  // OpenAI recommends replacing newlines with spaces for best results
  const input = _input.replace(/\n/g, " ");
  const embeddingData = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input,
  });
  // console.log(embeddingData);

  console.log("Generated embedding for:", input.slice(0, 50) + "...");

  const [{ embedding }] = (embeddingData as any).data;
  return embedding;
}
