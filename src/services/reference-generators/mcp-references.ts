import { BaseReferenceGenerator } from "./base-generator.ts";
import { ReferenceManager } from "../reference-manager.ts";

export class MCPReferenceGenerator extends BaseReferenceGenerator {
  constructor(refManager: ReferenceManager) {
    super(refManager, {
      category: "mcp",
      sourceUrls: ["mcp.md"],
    });
  }

  async generate(): Promise<void> {
    const contents = await this.fetchAllSources();
    await this.generateFromContent(contents);
  }

  async generateFromContent(contents: Map<string, string>): Promise<void> {
    const mcpMd = contents.get("mcp.md") || "";

    await this.writeReference(
      "overview.md",
      "MCP Overview",
      this.generateOverview(mcpMd)
    );

    await this.writeReference(
      "server-configuration.md",
      "Server Configuration",
      this.generateServerConfiguration(mcpMd)
    );

    await this.writeReference(
      "tool-naming.md",
      "Tool Naming",
      this.generateToolNaming(mcpMd)
    );
  }

  generateOverview(content: string): string {
    const lines: string[] = [];
    lines.push("# MCP Overview");
    lines.push("");
    lines.push("Model Context Protocol integration with Claude Code.");
    lines.push("");

    lines.push("## What is MCP?");
    lines.push("");
    lines.push("MCP (Model Context Protocol) lets Claude Code connect to external");
    lines.push("services and tools through a standardized protocol.");
    lines.push("");

    lines.push("## When to Use MCP");
    lines.push("");
    lines.push("| Use Case | Example |");
    lines.push("| --- | --- |");
    lines.push("| External APIs | GitHub, Slack, databases |");
    lines.push("| Persistent state | Memory, knowledge bases |");
    lines.push("| Specialized tools | Custom integrations |");
    lines.push("");

    lines.push("## Configuration Location");
    lines.push("");
    lines.push("| Location | Scope |");
    lines.push("| --- | --- |");
    lines.push("| `~/.claude/.mcp.json` | All projects |");
    lines.push("| `.mcp.json` | Current project |");
    lines.push("| Plugin `.mcp/mcp.json` | Plugin scope |");
    lines.push("");

    lines.push("## See Also");
    lines.push("");
    lines.push("- [Server Configuration](./server-configuration.md)");
    lines.push("- [Tool Naming](./tool-naming.md)");

    return lines.join("\n");
  }

  generateServerConfiguration(content: string): string {
    const lines: string[] = [];
    lines.push("# Server Configuration");
    lines.push("");
    lines.push("Configure MCP servers in `.mcp.json`.");
    lines.push("");

    lines.push("## Configuration Schema");
    lines.push("");
    lines.push("```json");
    lines.push("{");
    lines.push('  "mcpServers": {');
    lines.push('    "<server-name>": {');
    lines.push('      "command": "npx",');
    lines.push('      "args": ["<package>", "<args>"],');
    lines.push('      "env": { "KEY": "value" }');
    lines.push("    }");
    lines.push("  }");
    lines.push("}");
    lines.push("```");
    lines.push("");

    lines.push("## Server Fields");
    lines.push("");
    lines.push("| Field | Required | Description |");
    lines.push("| --- | --- | --- |");
    lines.push("| `command` | yes | Command to start the server |");
    lines.push("| `args` | no | Command arguments array |");
    lines.push("| `env` | no | Environment variables |");
    lines.push("");

    lines.push("## Example: Memory Server");
    lines.push("");
    lines.push("```json");
    lines.push("{");
    lines.push('  "mcpServers": {');
    lines.push('    "memory": {');
    lines.push('      "command": "npx",');
    lines.push('      "args": ["-y", "@modelcontextprotocol/server-memory"]');
    lines.push("    }");
    lines.push("  }");
    lines.push("}");
    lines.push("```");
    lines.push("");

    lines.push("## Example: Filesystem Server");
    lines.push("");
    lines.push("```json");
    lines.push("{");
    lines.push('  "mcpServers": {');
    lines.push('    "filesystem": {');
    lines.push('      "command": "npx",');
    lines.push('      "args": [');
    lines.push('        "-y",');
    lines.push('        "@modelcontextprotocol/server-filesystem",');
    lines.push('        "/allowed/path"');
    lines.push("      ]");
    lines.push("    }");
    lines.push("  }");
    lines.push("}");
    lines.push("```");

    return lines.join("\n");
  }

  generateToolNaming(content: string): string {
    const lines: string[] = [];
    lines.push("# Tool Naming");
    lines.push("");
    lines.push("MCP tool naming conventions and patterns.");
    lines.push("");

    lines.push("## Naming Pattern");
    lines.push("");
    lines.push("MCP tools follow: `mcp__<server>__<tool>`");
    lines.push("");
    lines.push("| Pattern | Example |");
    lines.push("| --- | --- |");
    lines.push("| `mcp__<server>__<tool>` | `mcp__memory__create_entities` |");
    lines.push("");

    lines.push("## Common Tool Names");
    lines.push("");
    lines.push("| Tool | Description |");
    lines.push("| --- | --- |");
    lines.push("| `mcp__memory__create_entities` | Create memory entries |");
    lines.push("| `mcp__memory__search_entities` | Search memory |");
    lines.push("| `mcp__filesystem__read_file` | Read file contents |");
    lines.push("| `mcp__filesystem__write_file` | Write to file |");
    lines.push("| `mcp__github__search_repositories` | Search GitHub repos |");
    lines.push("");

    lines.push("## Using in Hooks");
    lines.push("");
    lines.push("Match MCP tools in hook matchers:");
    lines.push("");
    lines.push("```json");
    lines.push("{");
    lines.push('  "matcher": "mcp__memory__.*"');
    lines.push("}");
    lines.push("```");
    lines.push("");

    lines.push("## Patterns");
    lines.push("");
    lines.push("| Pattern | Matches |");
    lines.push("| --- | --- |");
    lines.push("| `mcp__memory__.*` | All memory server tools |");
    lines.push("| `mcp__.*__read.*` | Any read tool from any server |");
    lines.push("| `mcp__github__.*` | All GitHub server tools |");

    return lines.join("\n");
  }
}
