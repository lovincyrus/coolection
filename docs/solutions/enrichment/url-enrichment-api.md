---
tags: [enrichment, api, openai, metadata, knowledge-graph]
category: features
module: bookmarks
symptoms: need-to-improve-url-lookup, need-structured-metadata
---

# URL Enrichment API for Knowledge-Graph Pattern Matching

## Problem

During the URL lookup flow, we need to associate websites with creator/author names, organizations, content types, and topics to enable better discovery and pattern matching - similar to a knowledge graph approach.

## Solution

Implemented a URL enrichment API that uses OpenAI to extract structured metadata about URLs:

### Architecture

1. **Enrichment Function** (`lib/enrich-url.ts`)
   - Takes URL, title, description, and content as input
   - Calls OpenAI chat API with a structured prompt requesting JSON output
   - Returns `UrlContext` with: creator, organization, contentType, topics, description

2. **Integration Point** (`lib/add-website.ts`)
   - Calls `enrichUrl()` when processing new bookmarks
   - Stores result in `Item.context` JSON field
   - Non-blocking: enrichment failures don't prevent bookmark creation

3. **Search Enhancement** (`app/api/search/route.ts`)
   - Search queries now include context field via `LOWER("context"::text) ILIKE %query%`
   - Enables discovery by creator, organization, or inferred topics

4. **Backfill Script** (`prisma/backfill-context.ts`)
   - Processes existing items without context
   - Batch processing (10 items) with 1s delays to avoid rate limiting
   - Handles enrichment failures gracefully

### Data Flow

```
URL saved → getMetatags() → enrichUrl() → OpenAI API → UrlContext stored
                              ↓
Search query → Matches title, description, URL, OR context fields
```

### API Request Example

```typescript
const context = await enrichUrl(
  "https://example.com/article",
  "Understanding React Hooks",
  "A guide to React Hooks...",
  "Full article content..."
);

// Returns:
{
  creator: "Dan Abramov",
  organization: "Meta",
  contentType: "tutorial",
  topics: ["react", "hooks", "javascript"],
  description: "Educational article about React Hooks patterns"
}
```

## Key Design Decisions

### 1. Graceful Degradation
- If `OPENAI_API_KEY` is not set, enrichment is skipped
- If enrichment fails, bookmark is still saved without context
- Prevents API availability from blocking bookmark creation

### 2. Async & Non-Blocking
- Enrichment happens after URL is fetched but before item creation
- No background jobs needed for new items (enrichment completes during request)
- For bulk operations: enrichment completes per-item

### 3. Batch Processing for Backfill
- Items processed in groups of 10 to balance throughput vs rate limiting
- 1-second delay between batches prevents API throttling
- Errors logged but don't stop batch processing

### 4. JSON Storage
- Context stored as JSONB in PostgreSQL for querying flexibility
- Searchable as text via `context::text` casting
- Extensible: can add more fields without migration

## Usage

### For New Bookmarks (Automatic)
```typescript
// In app/api/item/create/route.ts or via addWebsite()
const newItem = await addWebsite(url, userId);
// Context is automatically enriched if OPENAI_API_KEY is set
```

### Backfill Existing URLs
```bash
# Set your OpenAI API key
export OPENAI_API_KEY="sk-..."

# Run backfill script
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/backfill-context.ts
```

Output:
```
Starting context backfill process...
Found 42 items without context to enrich
Processing batch 1 of 5 (10 items)
  Enriching: Understanding React (https://react.dev/...)
    ✓ Enriched
  [...]
✓ Backfill complete!
  Total processed: 42
  Successfully enriched: 40
  Failed: 2
```

## Search Integration

With enrichment, users can now search by:

```
Query: "react"
Results:
  - Items with "react" in title/description
  - Items with creator/org containing "react"
  - Items with "react" in topics

Query: "Dan Abramov"
Results:
  - Items created by Dan Abramov (via context.creator)

Query: "tutorial"
Results:
  - Items with contentType="tutorial"
```

## OpenAI Model Details

- **Model**: `gpt-4o-mini` (cost-effective for structured extraction)
- **Tokens**: ~150-200 tokens per request (max_tokens: 200)
- **Response Format**: JSON (parsed with error handling)
- **Cost**: ~$0.00001 per enrichment at current rates

## Error Handling

| Scenario | Behavior |
|----------|----------|
| OPENAI_API_KEY not set | Skips enrichment, saves bookmark |
| API rate limit | Logged, bookmark saved, returns null |
| Invalid JSON response | Logged, bookmark saved, returns null |
| Network error | Caught, logged, bookmark saved, returns null |

## TypeScript Types

```typescript
interface UrlContext {
  creator?: string;
  organization?: string;
  contentType?: string;
  topics?: string[];
  description?: string;
}

interface Item {
  // ... other fields
  context?: UrlContext;
}
```

## Performance Considerations

- Enrichment adds ~200-500ms per bookmark (API latency)
- Backfill: ~30 items/minute at 1s batch delay
- Search: Context is indexed as JSONB, no performance impact
- Bulk create: If enriching 100 URLs, expect +50-100s overhead

## Future Enhancements

1. **Caching**: Store enrichment results to avoid re-enriching similar URLs
2. **Batch Enrichment**: Send multiple URLs to OpenAI in one request
3. **Async Backfill**: Use a background job queue instead of blocking script
4. **Vector Search**: Convert context to embeddings for semantic search
5. **Custom Models**: Allow per-organization enrichment strategies
