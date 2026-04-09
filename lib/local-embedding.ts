import { type EmbeddingsModel, initModel } from "@energetic-ai/embeddings";
import { modelSource } from "@energetic-ai/model-embeddings-en";

let model: EmbeddingsModel | null = null;

async function getModel(): Promise<EmbeddingsModel> {
  if (!model) {
    model = await initModel(modelSource);
  }
  return model;
}

export async function generateLocalEmbedding(input: string): Promise<number[]> {
  const m = await getModel();
  return m.embed(input.replace(/\n/g, " "));
}
