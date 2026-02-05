export interface ExtractedTable {
  headers: string[];
  rows: string[][];
}

export interface CodeBlock {
  language: string;
  code: string;
}

export interface ExtractedSection {
  title: string;
  content: string;
  tables: ExtractedTable[];
  codeBlocks: CodeBlock[];
}

export interface Heading {
  level: number;
  title: string;
}

export class ContentExtractor {
  extractTables(markdown: string): ExtractedTable[] {
    if (!markdown.trim()) {
      return [];
    }

    const tables: ExtractedTable[] = [];
    const lines = markdown.split("\n");

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      // Look for table header row (must have pipes)
      if (this.isTableRow(line) && i + 1 < lines.length) {
        const nextLine = lines[i + 1];

        // Check if next line is separator (|---|---|)
        if (this.isTableSeparator(nextLine)) {
          const headers = this.parseTableRow(line);
          const rows: string[][] = [];

          // Parse data rows
          let j = i + 2;
          while (j < lines.length && this.isTableRow(lines[j])) {
            rows.push(this.parseTableRow(lines[j]));
            j++;
          }

          tables.push({ headers, rows });
          i = j;
          continue;
        }
      }
      i++;
    }

    return tables;
  }

  extractSection(markdown: string, heading: string): ExtractedSection | null {
    if (!markdown.trim()) {
      return null;
    }

    const lines = markdown.split("\n");
    const headingLower = heading.toLowerCase();

    let startIndex = -1;
    let sectionLevel = 0;
    let actualTitle = "";

    // Find the heading
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headingMatch) {
        const level = headingMatch[1].length;
        const title = headingMatch[2].trim();

        if (title.toLowerCase() === headingLower) {
          startIndex = i;
          sectionLevel = level;
          actualTitle = title;
          break;
        }
      }
    }

    if (startIndex === -1) {
      return null;
    }

    // Find the end of the section (next heading at same or higher level)
    let endIndex = lines.length;
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      const headingMatch = line.match(/^(#{1,6})\s+.+$/);

      if (headingMatch) {
        const level = headingMatch[1].length;
        if (level <= sectionLevel) {
          endIndex = i;
          break;
        }
      }
    }

    // Extract section content (excluding the heading line itself)
    const sectionLines = lines.slice(startIndex + 1, endIndex);
    const sectionContent = sectionLines.join("\n").trim();

    return {
      title: actualTitle,
      content: sectionContent,
      tables: this.extractTables(sectionContent),
      codeBlocks: this.extractCodeBlocks(sectionContent),
    };
  }

  extractCodeBlocks(markdown: string): CodeBlock[] {
    if (!markdown.trim()) {
      return [];
    }

    const blocks: CodeBlock[] = [];
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;

    let match;
    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      blocks.push({
        language: match[1] || "",
        code: match[2].trim(),
      });
    }

    return blocks;
  }

  extractHeadings(markdown: string): Heading[] {
    if (!markdown.trim()) {
      return [];
    }

    const headings: Heading[] = [];
    const lines = markdown.split("\n");

    for (const line of lines) {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        headings.push({
          level: match[1].length,
          title: match[2].trim(),
        });
      }
    }

    return headings;
  }

  extractBulletList(markdown: string): string[] {
    if (!markdown.trim()) {
      return [];
    }

    const items: string[] = [];
    const lines = markdown.split("\n");

    for (const line of lines) {
      const match = line.match(/^\s*[-*]\s+(.+)$/);
      if (match) {
        items.push(match[1].trim());
      }
    }

    return items;
  }

  private isTableRow(line: string): boolean {
    return line.includes("|") && line.trim().startsWith("|");
  }

  private isTableSeparator(line: string): boolean {
    // Matches |---|---| or | --- | --- | patterns
    return /^\|[\s-:|]+\|$/.test(line.trim());
  }

  private parseTableRow(line: string): string[] {
    // Remove leading/trailing pipes and split by |
    const trimmed = line.trim();
    const withoutPipes = trimmed.slice(1, trimmed.length - 1);
    return withoutPipes.split("|").map((cell) => cell.trim());
  }
}
