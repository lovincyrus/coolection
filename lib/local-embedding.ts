import { type FeatureExtractionPipeline,pipeline } from "@huggingface/transformers";

let extractor: FeatureExtractionPipeline | null = null;

async function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractor) {
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      dtype: "fp32",
    });
  }
  return extractor;
}

export async function generateLocalEmbedding(input: string): Promise<number[]> {
  const ext = await getExtractor();
  const output = await ext(input.replace(/\n/g, " "), {
    pooling: "mean",
    normalize: true,
  });
  return Array.from(output.data as Float32Array);
}
