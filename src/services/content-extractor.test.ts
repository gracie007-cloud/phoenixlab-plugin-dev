import { describe, it, expect, beforeEach } from "bun:test";
import { ContentExtractor } from "./content-extractor.ts";

describe("ContentExtractor", () => {
  let extractor: ContentExtractor;

  beforeEach(() => {
    extractor = new ContentExtractor();
  });

  describe("extractTables", () => {
    it("should extract a simple markdown table", () => {
      const markdown = `
# Heading

Some text.

| Name | Type | Required |
|------|------|----------|
| id | string | Yes |
| name | string | No |

More text.
`;

      const tables = extractor.extractTables(markdown);

      expect(tables).toHaveLength(1);
      expect(tables[0].headers).toEqual(["Name", "Type", "Required"]);
      expect(tables[0].rows).toEqual([
        ["id", "string", "Yes"],
        ["name", "string", "No"],
      ]);
    });

    it("should extract multiple tables", () => {
      const markdown = `
| A | B |
|---|---|
| 1 | 2 |

| C | D |
|---|---|
| 3 | 4 |
`;

      const tables = extractor.extractTables(markdown);

      expect(tables).toHaveLength(2);
      expect(tables[0].headers).toEqual(["A", "B"]);
      expect(tables[1].headers).toEqual(["C", "D"]);
    });

    it("should return empty array for markdown without tables", () => {
      const markdown = `
# No Tables

Just some regular text content.
`;

      const tables = extractor.extractTables(markdown);

      expect(tables).toEqual([]);
    });

    it("should handle tables with empty cells", () => {
      const markdown = `
| Name | Default |
|------|---------|
| foo | |
| bar | baz |
`;

      const tables = extractor.extractTables(markdown);

      expect(tables).toHaveLength(1);
      expect(tables[0].rows).toEqual([
        ["foo", ""],
        ["bar", "baz"],
      ]);
    });

    it("should trim whitespace from cells", () => {
      const markdown = `
| Name   |   Type    |
|--------|-----------|
|  foo   |   string  |
`;

      const tables = extractor.extractTables(markdown);

      expect(tables[0].headers).toEqual(["Name", "Type"]);
      expect(tables[0].rows[0]).toEqual(["foo", "string"]);
    });

    it("should handle tables with inline code", () => {
      const markdown = `
| Field | Type |
|-------|------|
| \`name\` | \`string\` |
`;

      const tables = extractor.extractTables(markdown);

      expect(tables[0].rows[0]).toEqual(["`name`", "`string`"]);
    });
  });

  describe("extractSection", () => {
    it("should extract a section by h2 heading", () => {
      const markdown = `
# Main Title

## Events

Event content here.

More event details.

## Configuration

Config content.
`;

      const section = extractor.extractSection(markdown, "Events");

      expect(section).not.toBeNull();
      expect(section!.title).toBe("Events");
      expect(section!.content).toContain("Event content here");
      expect(section!.content).toContain("More event details");
      expect(section!.content).not.toContain("Config content");
    });

    it("should extract a section by h3 heading", () => {
      const markdown = `
## Parent Section

### Child Section

Child content.

### Another Child

Other content.
`;

      const section = extractor.extractSection(markdown, "Child Section");

      expect(section).not.toBeNull();
      expect(section!.title).toBe("Child Section");
      expect(section!.content).toContain("Child content");
      expect(section!.content).not.toContain("Other content");
    });

    it("should return null for non-existent section", () => {
      const markdown = `
## Introduction

Some content.
`;

      const section = extractor.extractSection(markdown, "Non-existent");

      expect(section).toBeNull();
    });

    it("should extract tables within the section", () => {
      const markdown = `
## Events

| Event | Description |
|-------|-------------|
| start | Fires on start |
| stop | Fires on stop |

## Other Section

| Other | Data |
|-------|------|
| a | b |
`;

      const section = extractor.extractSection(markdown, "Events");

      expect(section!.tables).toHaveLength(1);
      expect(section!.tables[0].headers).toEqual(["Event", "Description"]);
      expect(section!.tables[0].rows).toHaveLength(2);
    });

    it("should extract code blocks within the section", () => {
      const markdown = `
## Configuration

Example config:

\`\`\`json
{
  "name": "example"
}
\`\`\`

## Other Section

\`\`\`yaml
other: content
\`\`\`
`;

      const section = extractor.extractSection(markdown, "Configuration");

      expect(section!.codeBlocks).toHaveLength(1);
      expect(section!.codeBlocks[0].language).toBe("json");
      expect(section!.codeBlocks[0].code).toContain('"name": "example"');
    });

    it("should be case-insensitive for heading matching", () => {
      const markdown = `
## EVENT HANDLERS

Content about event handlers.
`;

      const section = extractor.extractSection(markdown, "event handlers");

      expect(section).not.toBeNull();
      expect(section!.title).toBe("EVENT HANDLERS");
    });
  });

  describe("extractCodeBlocks", () => {
    it("should extract code blocks with language hints", () => {
      const markdown = `
Example:

\`\`\`typescript
const x = 1;
\`\`\`

Another:

\`\`\`json
{"key": "value"}
\`\`\`
`;

      const blocks = extractor.extractCodeBlocks(markdown);

      expect(blocks).toHaveLength(2);
      expect(blocks[0].language).toBe("typescript");
      expect(blocks[0].code).toBe("const x = 1;");
      expect(blocks[1].language).toBe("json");
      expect(blocks[1].code).toBe('{"key": "value"}');
    });

    it("should handle code blocks without language hint", () => {
      const markdown = `
\`\`\`
plain code
\`\`\`
`;

      const blocks = extractor.extractCodeBlocks(markdown);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].language).toBe("");
      expect(blocks[0].code).toBe("plain code");
    });

    it("should return empty array for markdown without code blocks", () => {
      const markdown = `
# No Code

Just text here.
`;

      const blocks = extractor.extractCodeBlocks(markdown);

      expect(blocks).toEqual([]);
    });

    it("should preserve indentation in code blocks", () => {
      const markdown = `
\`\`\`typescript
function example() {
  if (true) {
    return "indented";
  }
}
\`\`\`
`;

      const blocks = extractor.extractCodeBlocks(markdown);

      expect(blocks[0].code).toContain("  if (true)");
      expect(blocks[0].code).toContain('    return "indented"');
    });
  });

  describe("extractHeadings", () => {
    it("should extract all headings with their levels", () => {
      const markdown = `
# Main Title

## Section One

### Subsection A

### Subsection B

## Section Two
`;

      const headings = extractor.extractHeadings(markdown);

      expect(headings).toHaveLength(5);
      expect(headings[0]).toEqual({ level: 1, title: "Main Title" });
      expect(headings[1]).toEqual({ level: 2, title: "Section One" });
      expect(headings[2]).toEqual({ level: 3, title: "Subsection A" });
      expect(headings[3]).toEqual({ level: 3, title: "Subsection B" });
      expect(headings[4]).toEqual({ level: 2, title: "Section Two" });
    });

    it("should handle headings with formatting", () => {
      const markdown = `
## **Bold Heading**

## \`Code Heading\`

## *Italic Heading*
`;

      const headings = extractor.extractHeadings(markdown);

      expect(headings).toHaveLength(3);
      expect(headings[0].title).toBe("**Bold Heading**");
      expect(headings[1].title).toBe("`Code Heading`");
      expect(headings[2].title).toBe("*Italic Heading*");
    });
  });

  describe("extractBulletList", () => {
    it("should extract bullet list items", () => {
      const markdown = `
Some intro text.

- Item one
- Item two
- Item three

Some outro text.
`;

      const items = extractor.extractBulletList(markdown);

      expect(items).toEqual(["Item one", "Item two", "Item three"]);
    });

    it("should handle mixed bullet markers", () => {
      const markdown = `
- Dash item
* Star item
- Another dash
`;

      const items = extractor.extractBulletList(markdown);

      expect(items).toEqual(["Dash item", "Star item", "Another dash"]);
    });

    it("should handle nested lists (flattened)", () => {
      const markdown = `
- Top level
  - Nested item
- Another top
`;

      const items = extractor.extractBulletList(markdown);

      expect(items).toContain("Top level");
      expect(items).toContain("Nested item");
      expect(items).toContain("Another top");
    });
  });

  describe("graceful degradation", () => {
    it("should handle empty input", () => {
      expect(extractor.extractTables("")).toEqual([]);
      expect(extractor.extractSection("", "Test")).toBeNull();
      expect(extractor.extractCodeBlocks("")).toEqual([]);
      expect(extractor.extractHeadings("")).toEqual([]);
      expect(extractor.extractBulletList("")).toEqual([]);
    });

    it("should handle malformed markdown", () => {
      const malformed = `
| incomplete table
|---
no closing

\`\`\`unclosed code block
`;

      // Should not throw
      expect(() => extractor.extractTables(malformed)).not.toThrow();
      expect(() => extractor.extractCodeBlocks(malformed)).not.toThrow();
    });
  });
});
