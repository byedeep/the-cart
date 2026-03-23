import { extractItemFromContent, type ExtractedItem } from "./ai";

export interface ProcessedUrlResult {
  url: string;
  markdownContent: string;
  extractedData: ExtractedItem;
  source: string;
}

interface StructuredData {
  title?: string;
  description?: string;
  price?: string;
  currency?: string;
  imageUrl?: string;
  brand?: string;
}

function extractStructuredDataFromMarkdown(markdown: string): StructuredData {
  const data: StructuredData = {};
  
  // Try to extract from markdown metadata if present
  const lines = markdown.split('\n');
  
  for (const line of lines.slice(0, 50)) { // Check first 50 lines
    // Look for price patterns
    if (!data.price) {
      const priceMatch = line.match(/(?:price|cost)\s*[:\-]?\s*[$€£]?\s*([\d,]+\.?\d*)/i);
      if (priceMatch && priceMatch[1]) {
        data.price = priceMatch[1].replace(',', '');
      }
    }
    
    // Look for currency
    if (!data.currency) {
      const currencyMatch = line.match(/\b(USD|EUR|GBP|CAD|AUD|JPY|CHF|CNY)\b/i);
      if (currencyMatch && currencyMatch[1]) {
        data.currency = currencyMatch[1].toUpperCase();
      }
    }
    
    // Look for image URLs
    if (!data.imageUrl) {
      const imageMatch = line.match(/https?:\/\/[^\s\)\"]+\.(?:jpg|jpeg|png|gif|webp)/i);
      if (imageMatch && imageMatch[0] && !imageMatch[0].includes('icon') && !imageMatch[0].includes('logo')) {
        data.imageUrl = imageMatch[0];
      }
    }
  }
  
  return data;
}

export async function processUrl(
  url: string,
  cerebrasApiKey: string,
  jinaApiKey: string
): Promise<ProcessedUrlResult> {
  // Use Jina AI Reader API to fetch and convert to markdown
  const jinaUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`;
  
  const response = await fetch(jinaUrl, {
    headers: {
      "Authorization": `Bearer ${jinaApiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch URL via Jina AI: ${response.status} ${response.statusText}`
    );
  }

  const markdownContent = await response.text();

  // Extract domain for source
  const urlObj = new URL(url);
  const source = urlObj.hostname.replace(/^www\./, "");

  // Extract structured data as hints
  const structuredData = extractStructuredDataFromMarkdown(markdownContent);

  // Use AI to extract structured data with hints
  const extractedData = await extractItemFromContent(
    markdownContent, 
    url, 
    cerebrasApiKey,
    structuredData
  );

  return {
    url,
    markdownContent,
    extractedData,
    source,
  };
}
