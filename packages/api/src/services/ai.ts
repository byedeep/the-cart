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
  apiKey: string
): Promise<ExtractedItem> {
  const systemPrompt = `You are an expert at extracting product/item information from web content.
Your task is to analyze the provided markdown content and extract structured information about the item.

Extract the following fields:
- title: The name/title of the item (required)
- description: A comprehensive description (required)
- price: Price with currency symbol if available (optional)
- currency: Currency code like USD, EUR (optional)
- brand: Brand or manufacturer name (optional)
- category: Product category like Electronics, Clothing, Books (optional)
- imageUrl: Primary image URL if mentioned (optional)
- confidence: Your confidence in this extraction (0-100)

Respond ONLY with a valid JSON object matching this structure. Do not include any other text, markdown formatting, or explanations.`;

  const userPrompt = `URL: ${url}

Markdown Content:
${markdownContent.slice(0, 8000)}

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
    return ExtractedItemSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse AI response:", content);
    throw new Error(
      `Failed to parse AI response: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
