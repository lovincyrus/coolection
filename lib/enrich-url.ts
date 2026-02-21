import { openai } from "./openai";

export interface UrlContext {
  creator?: string;
  organization?: string;
  contentType?: string;
  topics?: string[];
  description?: string;
}

export async function enrichUrl(
  url: string,
  title: string,
  description?: string,
  content?: string
): Promise<UrlContext | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY not set, skipping enrichment");
    return null;
  }

  try {
    const contextInput = `
URL: ${url}
Title: ${title}
Description: ${description || "N/A"}
Content Preview: ${content ? content.substring(0, 500) : "N/A"}

Extract structured information about this URL. Respond with a JSON object containing:
- creator: The author/creator name (if identifiable, otherwise null)
- organization: The organization/company (if identifiable, otherwise null)
- contentType: The type of content (e.g., "blog", "documentation", "news", "tool", "tutorial", "research", etc.)
- topics: An array of 2-4 main topics/keywords related to this content
- description: A brief 1-2 sentence summary

Return ONLY valid JSON, no other text.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: contextInput,
        },
      ],
    });

    const responseText = response.choices[0]?.message?.content || "";

    // Parse the JSON response
    const context = JSON.parse(responseText) as UrlContext;

    console.log("Enriched URL context:", { url, context });
    return context;
  } catch (error) {
    console.error("Failed to enrich URL:", {
      url,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    // Return null on error so that bookmark creation doesn't fail
    return null;
  }
}
