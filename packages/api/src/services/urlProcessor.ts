import TurndownService from "turndown";
import { extractItemFromContent, type ExtractedItem } from "./ai";

const turndownService = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

// Clean up the HTML before converting to markdown
turndownService.addRule("removeScripts", {
  filter: ["script", "style", "nav", "footer", "header", "aside"],
  replacement: () => "",
});

export interface ProcessedUrlResult {
  url: string;
  markdownContent: string;
  extractedData: ExtractedItem;
  source: string;
}

export async function processUrl(
  url: string,
  apiKey: string
): Promise<ProcessedUrlResult> {
  // Fetch the webpage
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch URL: ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();

  // Convert HTML to markdown
  const markdownContent = turndownService.turndown(html);

  // Extract domain for source
  const urlObj = new URL(url);
  const source = urlObj.hostname.replace(/^www\./, "");

  // Use AI to extract structured data
  const extractedData = await extractItemFromContent(markdownContent, url, apiKey);

  return {
    url,
    markdownContent,
    extractedData,
    source,
  };
}
