# The Cart - MVP Specification

## Overview
A unified cart system where users can paste any URL and automatically generate structured product/item cards. Uses AI to extract meaningful data from any website.

## Core Architecture

### Tech Stack
- **Frontend**: React + TanStack Start (existing)
- **Backend**: Hono + tRPC (existing)
- **Database**: SQLite + Drizzle ORM (existing)
- **Markdown Extraction**: Jina AI API (`https://r.jina.ai/http://URL`)
- **AI Processing**: Cerebras AI
- **Browser Extension**: Manifest V3 (Chrome/Firefox compatible)

## Data Flow

```
User pastes URL
    ↓
Frontend sends URL to API
    ↓
Backend calls Jina AI API → Returns Markdown
    ↓
Backend sends Markdown + Prompt to Cerebras
    ↓
Cerebras returns structured JSON
    ↓
Store in Database
    ↓
Return Card to Frontend
```

## Database Schema

### Cart Item Structure
```typescript
{
  id: string;                    // UUID
  userId: string;                // Foreign key to auth.users
  url: string;                   // Original URL
  source: string;                // Domain (e.g., "amazon.com")
  
  // Extracted by AI
  title: string;                 // Product/item title
  description: string;           // Brief description
  price?: string;                // Price if available
  currency?: string;             // Currency code
  imageUrl?: string;             // Primary image URL
  brand?: string;                // Brand/manufacturer
  category?: string;             // Auto-categorized
  
  // Metadata
  markdownContent: string;       // Raw markdown from Jina
  aiConfidence: number;          // 0-1 confidence score
  
  // User additions
  notes?: string;                // User notes
  tags: string[];                // User tags
  priority: 'low' | 'medium' | 'high';
  status: 'saved' | 'purchased' | 'archived';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints (tRPC)

### Cart Operations
- `cart.getAll` - Get all user's cart items
- `cart.getById` - Get single item details
- `cart.create` - Create new item from URL
  - Input: `{ url: string }`
  - Process: Fetch markdown → Gemini extraction → Save
- `cart.update` - Update item fields
- `cart.delete` - Remove item
- `cart.search` - Search/filter by tags, title, etc.

## Cerebras Prompt Template

```
You are a data extraction assistant. Extract structured product information from the following markdown content.

Return ONLY a JSON object with this exact structure:
{
  "title": "Product name/title",
  "description": "Brief 1-2 sentence description",
  "price": "Price string or null if not found",
  "currency": "USD/EUR/etc or null",
  "imageUrl": "Primary image URL or null",
  "brand": "Brand name or null",
  "category": "One of: electronics, clothing, books, home, food, other"
}

Rules:
- If price is found, include currency symbol/code
- Image URL should be the main product image
- Keep descriptions under 200 characters
- Return valid JSON only, no markdown code blocks

Markdown content:
{MARKDOWN_CONTENT}
```

## Frontend Components

### Main Cart Page (`/cart`)
- URL input bar with "Add" button
- Grid/list view toggle
- Filter by: tags, status, source, category
- Sort by: date, price, priority
- Search bar

### Card Component
- Image thumbnail
- Title + source badge
- Price (if available)
- Tags
- Quick actions: edit, delete, mark purchased
- Expand for full description + notes

### Add Item Modal
- URL input
- Preview extracted data before saving
- Edit fields manually
- Add tags/notes

## Browser Extension

### Manifest V3 Structure
```
apps/extension/
├── manifest.json          # Extension manifest
├── background/            # Service worker
│   └── index.ts          # Context menu, message handling
├── content/              # Content scripts
│   └── index.ts         # Page interaction
├── popup/               # Extension popup UI
│   ├── index.html
│   ├── index.tsx
│   └── components/
├── options/             # Extension settings
│   └── index.html
└── lib/                 # Shared utilities
    └── api.ts          # Communication with backend
```

### Extension Features
1. **Context Menu**: Right-click any link → "Add to Cart"
2. **Page Action**: Click extension icon to add current page
3. **Quick Add**: Popup with recently added items
4. **Auth**: Sync with web app session

## Jina AI Integration

### API Call
```typescript
const getMarkdown = async (url: string) => {
  const response = await fetch(`https://r.jina.ai/http://${url}`);
  return response.text();
};
```

### Rate Limits
- Free tier: 200 requests/day
- No API key required for basic usage

## Environment Variables

```bash
# Server (.env)
CEREBRAS_API_KEY=your_cerebras_api_key
JINA_API_KEY=optional_for_higher_limits

# Extension
VITE_API_URL=http://localhost:3000
```

## MVP Scope (Week 1-2)

### Must Have
- [ ] Database schema migration
- [ ] Basic cart API (create, list, delete)
- [ ] URL → Markdown → AI → Card flow
- [ ] Simple grid UI for viewing cards
- [ ] Extension folder structure
- [ ] Extension context menu "Add to Cart"

### Nice to Have
- [ ] Manual edit of extracted data
- [ ] Tags system
- [ ] Search/filter
- [ ] Status management (saved/purchased/archived)
- [ ] Extension popup UI

## Future Enhancements (Post-MVP)

1. **Website-Specific Parsers**: Custom parsers for Amazon, eBay, etc. for better accuracy
2. **Price Tracking**: Monitor price changes over time
3. **Sharing**: Share carts with other users
4. **Collections**: Organize items into folders/wishlists
5. **Mobile App**: React Native companion
6. **AI Improvements**: Image analysis, better categorization

## Success Metrics

- Successfully extract data from 80%+ of URLs
- Average extraction time < 5 seconds
- User can add item in < 10 seconds

## Notes

- Cerebras API offers fast inference for LLMs
- Jina AI free tier should suffice for initial testing
- Extension will use same auth session as web app
- Consider caching markdown to avoid re-fetching
