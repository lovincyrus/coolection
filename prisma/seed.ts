import fs from "fs";
import path from "path";

import { openai } from "../lib/openai";
import prisma from "../lib/prisma";
import coolection from "./coolection-with-embeddings.json";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("process.env.OPENAI_API_KEY is not defined. Please set it.");
}

if (!process.env.DATABASE_URL) {
  throw new Error("process.env.DATABASE_URL is not defined. Please set it.");
}

async function _generateEmbeddingsFile() {
  let dataWithEmbeddings = [];

  for (const record of coolection.data) {
    console.log("record: ", record);

    // Generate the embedding for each title
    const embedding = await generateEmbedding(record.title);
    await new Promise((r) => setTimeout(r, 500)); // Wait 500ms between requests

    // Here, you should adjust according to your actual data structure
    // Assuming `record` has all necessary fields except the embedding
    const data = { ...record, embedding };

    // Add the data with embedding to the array
    dataWithEmbeddings.push(data);
  }

  // Write the data with embeddings into a new JSON file
  fs.writeFileSync(
    path.join(__dirname, "./coolection-with-embeddings.json"),
    JSON.stringify({ data: dataWithEmbeddings }, null, 2)
  );
  console.log("Coolection data with embeddings seeded successfully!");
}

async function main() {
  try {
    const tiramisu = await prisma.coolection.findFirst({
      where: {
        title: "Classic Tiramisù Recipe (with Video) - NYT Cooking",
      },
    });
    if (tiramisu) {
      console.log("Coolection already seeded!");
      return;
    }
  } catch (error) {
    console.error('Error checking if "Tiramisu" exists in the database.');
    throw error;
  }

  for (const record of (coolection as any).data) {
    const { embedding, ...p } = record;

    const coolection = await prisma.coolection.create({
      data: p,
    });

    // Add the embedding
    await prisma.$executeRaw`
      UPDATE coolection
      SET embedding = ${JSON.stringify(embedding)}::vector
      WHERE id = ${coolection.id}
    `;

    console.log(`Added ${coolection.title}`);
  }

  console.log("Coolection data seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

async function generateEmbedding(_input: string) {
  const input = _input.replace(/\n/g, " ");
  const embeddingData = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input,
  });
  console.log(embeddingData);
  const [{ embedding }] = (embeddingData as any).data;
  return embedding;
}
