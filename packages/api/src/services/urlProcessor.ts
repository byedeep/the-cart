import { extractItemFromContent, type ExtractedItem } from "./ai";

export interface ProcessedUrlResult {
  url: string;
  markdownContent: string;
  extractedData: ExtractedItem;
  source: string;
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

  // Use AI to extract structured data
  const extractedData = await extractItemFromContent(markdownContent, url, cerebrasApiKey);

  return {
    url,
    markdownContent,
    extractedData,
    source,
  };
}
