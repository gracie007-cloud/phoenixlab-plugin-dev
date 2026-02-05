import { BaseReferenceGenerator } from "./base-generator.ts";
import { ReferenceManager } from "../reference-manager.ts";

export class CLIReferenceGenerator extends BaseReferenceGenerator {
  constructor(refManager: ReferenceManager) {
    super(refManager, {
      category: "cli",
      sourceUrls: ["cli-reference.md", "headless.md"],
    });
  }

  async generate(): Promise<void> {
    const contents = await this.fetchAllSources();
    await this.generateFromContent(contents);
  }

  async generateFromContent(contents: Map<string, string>): Promise<void> {
    const cliMd = contents.get("cli-reference.md") || "";
    const headlessMd = contents.get("headless.md") || "";

    await this.writeReference(
      "commands-reference.md",
      "CLI Commands Reference",
      this.generateCommandsReference(cliMd)
    );

    await this.writeReference(
      "input-modes.md",
      "Input Modes",
      this.generateInputModes(cliMd, headlessMd)
    );

    await this.writeReference(
      "environment-variables.md",
      "Environment Variables",
      this.generateEnvironmentVariables(cliMd)
    );
  }

  generateCommandsReference(content: string): string {
    const lines: string[] = [];
    lines.push("# CLI Commands Reference");
    lines.push("");
    lines.push("Claude Code command-line interface commands and flags.");
    lines.push("");

    lines.push("## Basic Usage");
    lines.push("");
    lines.push("```bash");
    lines.push("claude [options] [prompt]");
    lines.push("```");
    lines.push("");

    lines.push("## Common Commands");
    lines.push("");
    lines.push("| Command | Description |");
    lines.push("| --- | --- |");
    lines.push("| `claude` | Start interactive session |");
    lines.push("| `claude \"prompt\"` | Start with initial prompt |");
    lines.push("| `claude --resume` | Resume last session |");
    lines.push("| `claude --continue` | Continue last conversation |");
    lines.push("| `claude plugin <cmd>` | Manage plugins |");
    lines.push("");

    lines.push("## Global Flags");
    lines.push("");
    lines.push("| Flag | Description |");
    lines.push("| --- | --- |");
    lines.push("| `-p, --print` | Print response and exit (non-interactive) |");
    lines.push("| `--resume` | Resume the most recent session |");
    lines.push("| `--continue` | Continue the most recent conversation |");
    lines.push("| `--model <alias>` | Use specific model |");
    lines.push("| `--agent <name>` | Start with specific agent |");
    lines.push("| `--debug` | Enable debug output |");
    lines.push("| `--no-color` | Disable colored output |");

    return lines.join("\n");
  }

  generateInputModes(cliContent: string, headlessContent: string): string {
    const lines: string[] = [];
    lines.push("# Input Modes");
    lines.push("");
    lines.push("Different ways to provide input to Claude Code.");
    lines.push("");

    lines.push("## Mode Reference");
    lines.push("");
    lines.push("| Mode | Description | Use Case |");
    lines.push("| --- | --- | --- |");
    lines.push("| Interactive | Terminal UI | Development, exploration |");
    lines.push("| Pipe | Read from stdin | Scripting |");
    lines.push("| Headless (`-p`) | Non-interactive | CI/CD, automation |");
    lines.push("");

    lines.push("## Interactive Mode");
    lines.push("");
    lines.push("```bash");
    lines.push("claude              # Start interactive session");
    lines.push("claude \"prompt\"     # Start with initial prompt");
    lines.push("```");
    lines.push("");

    lines.push("## Pipe Mode");
    lines.push("");
    lines.push("```bash");
    lines.push("echo \"What is this?\" | claude");
    lines.push("cat file.txt | claude \"Summarize this\"");
    lines.push("```");
    lines.push("");

    lines.push("## Headless Mode");
    lines.push("");
    lines.push("Non-interactive mode for automation:");
    lines.push("");
    lines.push("```bash");
    lines.push("claude -p \"Generate a README\"");
    lines.push("claude -p \"Fix the bug\" --output-format json");
    lines.push("```");
    lines.push("");

    lines.push("## Output Formats");
    lines.push("");
    lines.push("| Format | Description |");
    lines.push("| --- | --- |");
    lines.push("| `text` | Plain text (default) |");
    lines.push("| `json` | Structured JSON output |");
    lines.push("| `stream-json` | Streaming JSON events |");

    return lines.join("\n");
  }

  generateEnvironmentVariables(content: string): string {
    const lines: string[] = [];
    lines.push("# Environment Variables");
    lines.push("");
    lines.push("Environment variables for configuring Claude Code.");
    lines.push("");

    lines.push("## Core Variables");
    lines.push("");
    lines.push("| Variable | Description |");
    lines.push("| --- | --- |");
    lines.push("| `ANTHROPIC_API_KEY` | API key for Claude |");
    lines.push("| `CLAUDE_CODE_USE_BEDROCK` | Use Amazon Bedrock |");
    lines.push("| `CLAUDE_CODE_USE_VERTEX` | Use Google Vertex AI |");
    lines.push("");

    lines.push("## Hook Variables");
    lines.push("");
    lines.push("| Variable | Description |");
    lines.push("| --- | --- |");
    lines.push("| `CLAUDE_PROJECT_DIR` | Project root directory |");
    lines.push("| `CLAUDE_PLUGIN_ROOT` | Plugin root directory |");
    lines.push("| `CLAUDE_ENV_FILE` | Environment file path |");
    lines.push("| `CLAUDE_CODE_REMOTE` | Set in remote environments |");
    lines.push("");

    lines.push("## Network Variables");
    lines.push("");
    lines.push("| Variable | Description |");
    lines.push("| --- | --- |");
    lines.push("| `HTTP_PROXY` | HTTP proxy URL |");
    lines.push("| `HTTPS_PROXY` | HTTPS proxy URL |");
    lines.push("| `NODE_EXTRA_CA_CERTS` | Custom CA certificates |");

    return lines.join("\n");
  }
}
