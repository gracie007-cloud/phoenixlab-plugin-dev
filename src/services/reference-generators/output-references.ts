import { BaseReferenceGenerator } from "./base-generator.ts";
import { ReferenceManager } from "../reference-manager.ts";

export class OutputReferenceGenerator extends BaseReferenceGenerator {
  constructor(refManager: ReferenceManager) {
    super(refManager, {
      category: "output",
      sourceUrls: ["output-styles.md", "statusline.md"],
    });
  }

  async generate(): Promise<void> {
    const contents = await this.fetchAllSources();
    await this.generateFromContent(contents);
  }

  async generateFromContent(contents: Map<string, string>): Promise<void> {
    const outputMd = contents.get("output-styles.md") || "";
    const statuslineMd = contents.get("statusline.md") || "";

    await this.writeReference(
      "output-styles.md",
      "Output Styles",
      this.generateOutputStyles(outputMd)
    );

    await this.writeReference(
      "statusline.md",
      "Status Line",
      this.generateStatusLine(statuslineMd)
    );
  }

  generateOutputStyles(content: string): string {
    const lines: string[] = [];
    lines.push("# Output Styles");
    lines.push("");
    lines.push("Configure Claude Code output formatting.");
    lines.push("");

    lines.push("## Output Formats");
    lines.push("");
    lines.push("| Format | Use Case |");
    lines.push("| --- | --- |");
    lines.push("| `text` | Default terminal output |");
    lines.push("| `json` | Machine-readable output |");
    lines.push("| `stream-json` | Streaming events |");
    lines.push("");

    lines.push("## CLI Output Flags");
    lines.push("");
    lines.push("```bash");
    lines.push("# JSON output");
    lines.push("claude -p \"query\" --output-format json");
    lines.push("");
    lines.push("# Streaming JSON");
    lines.push("claude -p \"query\" --output-format stream-json");
    lines.push("```");
    lines.push("");

    lines.push("## Markdown Rendering");
    lines.push("");
    lines.push("Claude Code renders markdown in terminal:");
    lines.push("");
    lines.push("- Code blocks with syntax highlighting");
    lines.push("- Tables formatted for terminal width");
    lines.push("- Lists and headers styled");
    lines.push("");

    lines.push("## Verbose Mode");
    lines.push("");
    lines.push("Toggle verbose output with `Ctrl+O`:");
    lines.push("");
    lines.push("- Shows hook execution details");
    lines.push("- Displays tool input/output");
    lines.push("- Logs debug information");

    return lines.join("\n");
  }

  generateStatusLine(content: string): string {
    const lines: string[] = [];
    lines.push("# Status Line");
    lines.push("");
    lines.push("Configure the Claude Code status line display.");
    lines.push("");

    lines.push("## Status Line Components");
    lines.push("");
    lines.push("| Component | Description |");
    lines.push("| --- | --- |");
    lines.push("| Model | Current model being used |");
    lines.push("| Token count | Context usage |");
    lines.push("| Cost | Session cost estimate |");
    lines.push("| Permission mode | Current mode |");
    lines.push("");

    lines.push("## Configuration");
    lines.push("");
    lines.push("In settings.json:");
    lines.push("");
    lines.push("```json");
    lines.push("{");
    lines.push('  "statusline": {');
    lines.push('    "show": true,');
    lines.push('    "components": ["model", "tokens", "cost"]');
    lines.push("  }");
    lines.push("}");
    lines.push("```");
    lines.push("");

    lines.push("## Custom Status Line");
    lines.push("");
    lines.push("Create a custom status line with a script:");
    lines.push("");
    lines.push("```json");
    lines.push("{");
    lines.push('  "statusline": {');
    lines.push('    "command": "./scripts/statusline.sh"');
    lines.push("  }");
    lines.push("}");
    lines.push("```");
    lines.push("");

    lines.push("Script output becomes status line content.");

    return lines.join("\n");
  }
}
