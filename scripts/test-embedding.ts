import { generateLocalEmbedding } from "../lib/local-embedding";

function cosine(a: number[], b: number[]): number {
  return a.reduce((sum, v, i) => sum + v * b[i], 0);
}

const LISTS = [
  "Frontend Development. React, CSS, JavaScript, UI frameworks",
  "AI & Machine Learning. Neural networks, LLMs, deep learning, NLP",
  "DevOps & Infrastructure. Docker, Kubernetes, CI/CD, cloud deployment",
  "Design Inspiration. UI design, typography, color palettes, branding",
  "Cooking Recipes. Food, recipes, cooking techniques, restaurants",
];

const ITEMS = [
  { title: "React 19 — What's New", desc: "Overview of the latest React features and improvements" },
  { title: "Scaling Laws for LLMs", desc: "A study on how large language models scale with compute and data" },
  { title: "Kubernetes Documentation", desc: "Production-grade container orchestration" },
  { title: "Modern Dashboard Design", desc: "Clean minimal dashboard with beautiful typography" },
  { title: "Perfect Pasta Carbonara", desc: "The authentic Italian recipe with guanciale and pecorino" },
  { title: "Hacker News", desc: "Tech news and discussions" },
];

async function main() {
  console.log("Loading model...\n");

  const listEmbeddings = await Promise.all(LISTS.map((l) => generateLocalEmbedding(l)));
  const itemEmbeddings = await Promise.all(ITEMS.map((i) => generateLocalEmbedding(`${i.title} ${i.desc}`)));

  // Header
  const listNames = LISTS.map((l) => l.split(".")[0]);
  console.log("".padEnd(30) + listNames.map((n) => n.padEnd(14)).join(""));
  console.log("-".repeat(30 + listNames.length * 14));

  for (let i = 0; i < ITEMS.length; i++) {
    const label = ITEMS[i].title.slice(0, 28).padEnd(30);
    const scores = listEmbeddings.map((le) => {
      const sim = cosine(itemEmbeddings[i], le);
      const str = sim.toFixed(3);
      return sim >= 0.35 ? `*${str}*`.padEnd(14) : str.padEnd(14);
    });
    console.log(label + scores.join(""));
  }

  console.log("\n* = above 0.35 threshold");
}

main().catch(console.error);
