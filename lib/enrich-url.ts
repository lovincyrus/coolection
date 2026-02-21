import { openai } from "./openai";

export interface EnrichedContext {
  creator?: string;
  organization?: string;
  category?: string;
  entities?: string[];
  formatted: string;
}

/**
 * Extract enriched context from URL metadata using OpenAI.
 * Helps identify creator name, organization, and other key entities
 * for better knowledge graph pattern matching during lookups.
 *
 * @param title - The page title
 * @param description - The page description
 * @param content - Optional full article content
 * @returns Enriched context with key entities and a formatted summary
 */
export async function enrichUrl(
  title: string,
  description?: string,
  content?: string,
): Promise<EnrichedContext> {
  try {
    const contentSnippet = content ? content.slice(0, 2000) : "";
    const prompt = `Extract structured context from this webpage data for better search/discovery.

Title: ${title}
Description: ${description || "N/A"}
${contentSnippet ? `\nContent preview: ${contentSnippet}` : ""}

Return a JSON object with:
- creator: Author/creator name if identifiable (or null)
- organization: Company/organization name if identifiable (or null)
- category: General category like "blog", "news", "documentation", "product", etc. (or null)
- entities: Array of 2-3 key entities/topics mentioned (or [])

Example format:
{"creator": "Jane Doe", "organization": "Acme Inc", "category": "blog", "entities": ["AI", "workflows"]}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const content_response = response.choices[0]?.message?.content;
    if (!content_response) {
      return { formatted: title };
    }

    let parsed;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content_response.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      return { formatted: title };
    }

    if (!parsed) {
      return { formatted: title };
    }

    // Build a formatted context string for full-text search
    const parts: string[] = [];
    if (parsed.creator) parts.push(`by ${parsed.creator}`);
    if (parsed.organization) parts.push(`from ${parsed.organization}`);
    if (parsed.category) parts.push(`(${parsed.category})`);
    if (parsed.entities?.length) parts.push(`about ${parsed.entities.join(", ")}`);

    const formatted =
      parts.length > 0 ? `${title} ${parts.join(" ")}` : title;

    return {
      creator: parsed.creator || undefined,
      organization: parsed.organization || undefined,
      category: parsed.category || undefined,
      entities: parsed.entities || [],
      formatted,
    };
  } catch (error) {
    // Non-critical: if enrichment fails, just return the title
    console.warn("URL enrichment failed:", error instanceof Error ? error.message : "Unknown error");
    return { formatted: title };
  }
}
