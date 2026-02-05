import { BaseReferenceGenerator } from "./base-generator.ts";
import { ReferenceManager } from "../reference-manager.ts";

export class IntegrationReferenceGenerator extends BaseReferenceGenerator {
  constructor(refManager: ReferenceManager) {
    super(refManager, {
      category: "integrations",
      sourceUrls: ["chrome.md", "vs-code.md", "github-actions.md"],
    });
  }

  async generate(): Promise<void> {
    const contents = await this.fetchAllSources();
    await this.generateFromContent(contents);
  }

  async generateFromContent(contents: Map<string, string>): Promise<void> {
    const chromeMd = contents.get("chrome.md") || "";
    const vscodeMd = contents.get("vs-code.md") || "";
    const githubMd = contents.get("github-actions.md") || "";

    await this.writeReference(
      "chrome.md",
      "Chrome Integration",
      this.generateChromeIntegration(chromeMd)
    );

    await this.writeReference(
      "vs-code.md",
      "VS Code Integration",
      this.generateVSCodeIntegration(vscodeMd)
    );

    await this.writeReference(
      "github-actions.md",
      "GitHub Actions",
      this.generateGitHubActions(githubMd)
    );
  }

  generateChromeIntegration(content: string): string {
    const lines: string[] = [];
    lines.push("# Chrome Integration");
    lines.push("");
    lines.push("Connect Claude Code to Chrome for web automation.");
    lines.push("");

    lines.push("## Capabilities");
    lines.push("");
    lines.push("| Feature | Description |");
    lines.push("| --- | --- |");
    lines.push("| Page navigation | Open URLs, click links |");
    lines.push("| Form interaction | Fill forms, submit |");
    lines.push("| Console access | Read console logs |");
    lines.push("| Screenshot | Capture page screenshots |");
    lines.push("| Data extraction | Extract page content |");
    lines.push("");

    lines.push("## Setup");
    lines.push("");
    lines.push("1. Install Chrome extension");
    lines.push("2. Enable browser connection in Claude Code");
    lines.push("3. Grant necessary permissions");
    lines.push("");

    lines.push("## Use Cases");
    lines.push("");
    lines.push("- Test web applications");
    lines.push("- Debug with console logs");
    lines.push("- Automate form filling");
    lines.push("- Extract data from pages");
    lines.push("");

    lines.push("## Example");
    lines.push("");
    lines.push("```");
    lines.push("Open https://example.com and fill the login form");
    lines.push("```");

    return lines.join("\n");
  }

  generateVSCodeIntegration(content: string): string {
    const lines: string[] = [];
    lines.push("# VS Code Integration");
    lines.push("");
    lines.push("Use Claude Code within VS Code.");
    lines.push("");

    lines.push("## Features");
    lines.push("");
    lines.push("| Feature | Description |");
    lines.push("| --- | --- |");
    lines.push("| Inline diffs | See changes in editor |");
    lines.push("| @-mentions | Reference files and symbols |");
    lines.push("| Plan review | Review before applying |");
    lines.push("| Keyboard shortcuts | Quick access |");
    lines.push("");

    lines.push("## Installation");
    lines.push("");
    lines.push("1. Open VS Code Extensions");
    lines.push("2. Search for 'Claude Code'");
    lines.push("3. Click Install");
    lines.push("");

    lines.push("## Keyboard Shortcuts");
    lines.push("");
    lines.push("| Shortcut | Action |");
    lines.push("| --- | --- |");
    lines.push("| `Cmd+Shift+P` | Open Claude Code |");
    lines.push("| `Cmd+L` | Send selection to Claude |");
    lines.push("");

    lines.push("## @-mentions");
    lines.push("");
    lines.push("Reference context in prompts:");
    lines.push("");
    lines.push("- `@file.ts` - Reference a file");
    lines.push("- `@symbol` - Reference a function/class");
    lines.push("- `@selection` - Current selection");

    return lines.join("\n");
  }

  generateGitHubActions(content: string): string {
    const lines: string[] = [];
    lines.push("# GitHub Actions");
    lines.push("");
    lines.push("Run Claude Code in CI/CD pipelines.");
    lines.push("");

    lines.push("## Use Cases");
    lines.push("");
    lines.push("| Use Case | Description |");
    lines.push("| --- | --- |");
    lines.push("| Code review | Automated PR reviews |");
    lines.push("| Issue triage | Auto-label issues |");
    lines.push("| Documentation | Generate docs |");
    lines.push("| Test generation | Create tests |");
    lines.push("");

    lines.push("## Basic Workflow");
    lines.push("");
    lines.push("```yaml");
    lines.push("name: Claude Code Review");
    lines.push("on: [pull_request]");
    lines.push("");
    lines.push("jobs:");
    lines.push("  review:");
    lines.push("    runs-on: ubuntu-latest");
    lines.push("    steps:");
    lines.push("      - uses: actions/checkout@v4");
    lines.push("      - uses: anthropics/claude-code-action@v1");
    lines.push("        with:");
    lines.push("          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}");
    lines.push("          prompt: 'Review this PR for issues'");
    lines.push("```");
    lines.push("");

    lines.push("## Configuration");
    lines.push("");
    lines.push("| Input | Required | Description |");
    lines.push("| --- | --- | --- |");
    lines.push("| `anthropic-api-key` | yes | API key |");
    lines.push("| `prompt` | yes | Task prompt |");
    lines.push("| `model` | no | Model to use |");

    return lines.join("\n");
  }
}
