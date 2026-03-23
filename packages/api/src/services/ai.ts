import { z } from "zod";

const CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions";
const MODEL = "qwen-3-235b-a22b-instruct-2507";

// Schema for AI extraction response
export const ExtractedItemSchema = z.object({
  title: z.string().describe("The title/name of the item"),
  description: z.string().describe("A detailed description of the item"),
  price: z.string().optional().describe("The price if available (include currency)"),
  currency: z.string().optional().describe("Currency code (e.g., USD, EUR)"),
  brand: z.string().optional().describe("Brand or manufacturer name"),
  category: z.string().optional().describe("Product category (e.g., Electronics, Clothing, Books)"),
  imageUrl: z.string().optional().describe("Primary image URL if available"),
  confidence: z.number().min(0).max(100).describe("Confidence score 0-100"),
});

export type ExtractedItem = z.infer<typeof ExtractedItemSchema>;

interface CerebrasResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function extractItemFromContent(
  markdownContent: string,
  url: string,
  apiKey: string,
  hints?: { title?: string; description?: string; price?: string; currency?: string; imageUrl?: string; brand?: string }
): Promise<ExtractedItem> {
  const systemPrompt = `You are an expert at extracting product/item information from web content.
Your task is to analyze the provided markdown content and extract structured information about the item.

CRITICAL INSTRUCTIONS FOR ACCURACY:

1. PRICE EXTRACTION:
   - Look for the main/current price, not old/strikethrough prices
   - Price format: extract numbers only (e.g., "29.99" not "$29.99")
   - If multiple prices exist, pick the current/sale price
   - Common price indicators: "$", "€", "£", "USD", "EUR", "price", "cost"

2. CURRENCY EXTRACTION:
   - Use 3-letter ISO codes: USD, EUR, GBP, CAD, AUD, etc.
   - Infer from price symbol if not explicitly stated

3. IMAGE URL EXTRACTION:
   - Look for the main product image (usually the largest)
   - Extract full URLs starting with http:// or https://
   - Prefer high-resolution images
   - Avoid thumbnail URLs if possible
   - Common patterns: data-src, src, og:image, product images

4. TITLE EXTRACTION:
   - Get the product name without marketing fluff
   - Remove "Buy", "Shop", "Free Shipping" from title
   - Keep brand name + product model/name

Extract these fields:
- title: Clean product name (required)
- description: Key features, not marketing copy (required)
- price: Numbers only, no currency symbol (optional)
- currency: 3-letter code like USD, EUR (optional)
- brand: Manufacturer or brand name (optional)
- category: Product type like Electronics, Clothing (optional)
- imageUrl: Full URL to main product image (optional)
- confidence: Your confidence 0-100 based on data clarity

Respond ONLY with valid JSON. No markdown, no explanations.`;

  // Build hints section if available
  const hintsSection = hints && (hints.price || hints.currency || hints.imageUrl)
    ? `\n\nEXTRACTED HINTS (use these as reference but verify):\n${hints.price ? `- Price hint: ${hints.price}\n` : ''}${hints.currency ? `- Currency hint: ${hints.currency}\n` : ''}${hints.imageUrl ? `- Image URL hint: ${hints.imageUrl}\n` : ''}`
    : '';

  const userPrompt = `URL: ${url}

Markdown Content:
${markdownContent.slice(0, 8000)}${hintsSection}

Extract the item information and return as JSON.`;

  const response = await fetch(CEREBRAS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0,
      max_tokens: -1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Cerebras API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = (await response.json()) as CerebrasResponse;
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content in AI response");
  }

  // Try to parse the JSON response
  try {
    // Clean up the response - remove markdown code blocks if present
    const cleanedContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleanedContent);
    
    // Post-process and validate extracted data
    if (parsed.price) {
      // Clean price - remove currency symbols and whitespace
      parsed.price = String(parsed.price).replace(/[^\d.,]/g, '').trim();
      // Normalize decimal separator
      parsed.price = parsed.price.replace(',', '.');
    }
    
    if (parsed.imageUrl) {
      // Validate image URL format
      const imageUrl = String(parsed.imageUrl).trim();
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        parsed.imageUrl = imageUrl;
      } else if (imageUrl.startsWith('//')) {
        // Protocol-relative URL
        parsed.imageUrl = 'https:' + imageUrl;
      } else {
        // Invalid URL, clear it
        parsed.imageUrl = undefined;
      }
    }
    
    if (parsed.currency) {
      // Normalize currency to uppercase
      parsed.currency = String(parsed.currency).toUpperCase().trim();
    }
    
    if (parsed.title) {
      // Clean up title - remove common marketing phrases
      parsed.title = String(parsed.title)
        .replace(/\s*-\s*(Buy|Shop|Free Shipping|Best Price|Deal|Sale).*$/i, '')
        .replace(/\s*\|\s*.+$/, '')
        .trim();
    }
    
    return ExtractedItemSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse AI response:", content);
    throw new Error(
      `Failed to parse AI response: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
