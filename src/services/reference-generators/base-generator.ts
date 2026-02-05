import { ReferenceManager, type ReferenceFile } from "../reference-manager.ts";
import { ContentExtractor } from "../content-extractor.ts";

const DOCS_BASE_URL = "https://code.claude.com/docs/en";

export interface GeneratorConfig {
  category: string;
  sourceUrls: string[];
}

export abstract class BaseReferenceGenerator {
  protected extractor: ContentExtractor;

  constructor(
    protected refManager: ReferenceManager,
    protected config: GeneratorConfig
  ) {
    this.extractor = new ContentExtractor();
  }

  async fetchDocumentation(url: string): Promise<string> {
    const fullUrl = url.startsWith("http") ? url : `${DOCS_BASE_URL}/${url}`;
    const response = await fetch(fullUrl, {
      headers: {
        "User-Agent": "phoenixlab-plugin-dev/0.1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch documentation from ${fullUrl}: ${response.status}`);
    }

    return response.text();
  }

  async fetchAllSources(): Promise<Map<string, string>> {
    const contents = new Map<string, string>();

    for (const url of this.config.sourceUrls) {
      const content = await this.fetchDocumentation(url);
      contents.set(url, content);
    }

    return contents;
  }

  protected async writeReference(
    path: string,
    topic: string,
    content: string
  ): Promise<void> {
    const ref: ReferenceFile = {
      path: `${this.config.category}/${path}`,
      topic,
      content,
      lastUpdated: new Date(),
    };
    await this.refManager.writeReference(ref);
  }

  protected formatTable(
    headers: string[],
    rows: string[][]
  ): string {
    const lines: string[] = [];
    lines.push(`| ${headers.join(" | ")} |`);
    lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
    for (const row of rows) {
      lines.push(`| ${row.join(" | ")} |`);
    }
    return lines.join("\n");
  }

  abstract generate(): Promise<void>;
  abstract generateFromContent(contents: Map<string, string>): Promise<void>;
}
