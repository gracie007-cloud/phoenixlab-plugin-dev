import { BaseReferenceGenerator } from "./base-generator.ts";
import { ReferenceManager } from "../reference-manager.ts";

export class PluginReferenceGenerator extends BaseReferenceGenerator {
  constructor(refManager: ReferenceManager) {
    super(refManager, {
      category: "plugins",
      sourceUrls: ["plugins.md", "plugins-reference.md"],
    });
  }

  async generate(): Promise<void> {
    const contents = await this.fetchAllSources();
    await this.generateFromContent(contents);
  }

  async generateFromContent(contents: Map<string, string>): Promise<void> {
    const pluginsMd = contents.get("plugins.md") || "";
    const pluginsRefMd = contents.get("plugins-reference.md") || "";

    await this.writeReference(
      "manifest-schema.md",
      "Plugin Manifest Schema",
      this.generateManifestSchema(pluginsMd)
    );

    await this.writeReference(
      "component-types.md",
      "Component Types",
      this.generateComponentTypes(pluginsRefMd)
    );

    await this.writeReference(
      "directory-structure.md",
      "Directory Structure",
      this.generateDirectoryStructure(pluginsMd)
    );

    await this.writeReference(
      "installation-scopes.md",
      "Installation Scopes",
      this.generateInstallationScopes(pluginsMd)
    );

    await this.writeReference(
      "cli-commands.md",
      "Plugin CLI Commands",
      this.generateCliCommands(pluginsRefMd)
    );
  }

  generateManifestSchema(content: string): string {
    const lines: string[] = [];
    lines.push("# Plugin Manifest Schema");
    lines.push("");
    lines.push("The `plugin.json` file defines plugin metadata.");
    lines.push("");

    lines.push("## Required Fields");
    lines.push("");
    lines.push("| Field | Type | Description |");
    lines.push("| --- | --- | --- |");
    lines.push("| `name` | string | Unique plugin identifier |");
    lines.push("| `version` | string | Semantic version (e.g., 1.0.0) |");
    lines.push("");

    lines.push("## Optional Fields");
    lines.push("");
    lines.push("| Field | Type | Description |");
    lines.push("| --- | --- | --- |");
    lines.push("| `description` | string | What the plugin does |");
    lines.push("| `author` | string | Plugin author name |");
    lines.push("| `repository` | string | Source repository URL |");
    lines.push("| `homepage` | string | Plugin homepage URL |");
    lines.push("| `license` | string | License identifier |");
    lines.push("");

    lines.push("## Example");
    lines.push("");
    lines.push("```json");
    lines.push("{");
    lines.push('  "name": "my-plugin",');
    lines.push('  "version": "1.0.0",');
    lines.push('  "description": "My custom plugin",');
    lines.push('  "author": "Developer Name"');
    lines.push("}");
    lines.push("```");
    lines.push("");

    lines.push("## Location");
    lines.push("");
    lines.push("Must be at `.claude-plugin/plugin.json` in the plugin root.");

    return lines.join("\n");
  }

  generateComponentTypes(content: string): string {
    const lines: string[] = [];
    lines.push("# Component Types");
    lines.push("");
    lines.push("Plugin components that extend Claude Code.");
    lines.push("");

    lines.push("## Available Components");
    lines.push("");
    lines.push("| Component | Directory | Description |");
    lines.push("| --- | --- | --- |");
    lines.push("| Skills | `skills/` | Extended instructions and slash commands |");
    lines.push("| Agents | `agents/` | Custom subagent configurations |");
    lines.push("| Hooks | `hooks/hooks.json` | Lifecycle event handlers |");
    lines.push("| MCP Servers | `.mcp/mcp.json` | Model Context Protocol servers |");
    lines.push("");

    lines.push("## Skills");
    lines.push("");
    lines.push("Markdown files with frontmatter providing instructions.");
    lines.push("See [Skills Reference](../skills/frontmatter-reference.md).");
    lines.push("");

    lines.push("## Agents");
    lines.push("");
    lines.push("Custom subagent configurations for specialized tasks.");
    lines.push("See [Subagents Reference](../subagents/custom-agents.md).");
    lines.push("");

    lines.push("## Hooks");
    lines.push("");
    lines.push("Event handlers that run at lifecycle points.");
    lines.push("See [Hooks Reference](../hooks/events-overview.md).");
    lines.push("");

    lines.push("## MCP Servers");
    lines.push("");
    lines.push("Model Context Protocol server configurations.");
    lines.push("See [MCP Reference](../mcp/server-configuration.md).");

    return lines.join("\n");
  }

  generateDirectoryStructure(content: string): string {
    const lines: string[] = [];
    lines.push("# Directory Structure");
    lines.push("");
    lines.push("Standard plugin directory layout.");
    lines.push("");

    lines.push("## Structure");
    lines.push("");
    lines.push("```");
    lines.push("my-plugin/");
    lines.push("├── .claude-plugin/");
    lines.push("│   └── plugin.json         # Plugin manifest (required)");
    lines.push("├── skills/                 # Skill definitions");
    lines.push("│   └── my-skill/");
    lines.push("│       └── SKILL.md");
    lines.push("├── agents/                 # Custom subagents");
    lines.push("│   └── my-agent.md");
    lines.push("├── hooks/                  # Hook configurations");
    lines.push("│   └── hooks.json");
    lines.push("└── .mcp/                   # MCP server configs");
    lines.push("    └── mcp.json");
    lines.push("```");
    lines.push("");

    lines.push("## Required Files");
    lines.push("");
    lines.push("| File | Purpose |");
    lines.push("| --- | --- |");
    lines.push("| `.claude-plugin/plugin.json` | Plugin manifest |");
    lines.push("");

    lines.push("## Optional Directories");
    lines.push("");
    lines.push("| Directory | Purpose |");
    lines.push("| --- | --- |");
    lines.push("| `skills/` | Skill definitions |");
    lines.push("| `agents/` | Custom subagent configs |");
    lines.push("| `hooks/` | Hook configurations |");
    lines.push("| `.mcp/` | MCP server configurations |");

    return lines.join("\n");
  }

  generateInstallationScopes(content: string): string {
    const lines: string[] = [];
    lines.push("# Installation Scopes");
    lines.push("");
    lines.push("Where plugins can be installed and their visibility.");
    lines.push("");

    lines.push("## Scope Reference");
    lines.push("");
    lines.push("| Scope | Location | Availability |");
    lines.push("| --- | --- | --- |");
    lines.push("| user | `~/.claude/plugins/` | All projects |");
    lines.push("| project | `.claude/plugins/` | Current project only |");
    lines.push("| local | Direct path | Development mode |");
    lines.push("| managed | Admin-controlled | Organization-wide |");
    lines.push("");

    lines.push("## User Scope");
    lines.push("");
    lines.push("Plugins in `~/.claude/plugins/` are available globally.");
    lines.push("");
    lines.push("```bash");
    lines.push("claude plugin install --scope user <source>");
    lines.push("```");
    lines.push("");

    lines.push("## Project Scope");
    lines.push("");
    lines.push("Plugins in `.claude/plugins/` only affect the project.");
    lines.push("");
    lines.push("```bash");
    lines.push("claude plugin install --scope project <source>");
    lines.push("```");
    lines.push("");

    lines.push("## Local Development");
    lines.push("");
    lines.push("Reference a local directory for development:");
    lines.push("");
    lines.push("```bash");
    lines.push("claude plugin install --local ./my-plugin");
    lines.push("```");

    return lines.join("\n");
  }

  generateCliCommands(content: string): string {
    const lines: string[] = [];
    lines.push("# Plugin CLI Commands");
    lines.push("");
    lines.push("Commands for managing Claude Code plugins.");
    lines.push("");

    lines.push("## Command Reference");
    lines.push("");
    lines.push("| Command | Description |");
    lines.push("| --- | --- |");
    lines.push("| `claude plugin install <source>` | Install a plugin |");
    lines.push("| `claude plugin uninstall <name>` | Remove a plugin |");
    lines.push("| `claude plugin list` | List installed plugins |");
    lines.push("| `claude plugin enable <name>` | Enable a disabled plugin |");
    lines.push("| `claude plugin disable <name>` | Disable without removing |");
    lines.push("");

    lines.push("## Install Sources");
    lines.push("");
    lines.push("```bash");
    lines.push("# From npm");
    lines.push("claude plugin install @org/plugin-name");
    lines.push("");
    lines.push("# From GitHub");
    lines.push("claude plugin install github:user/repo");
    lines.push("");
    lines.push("# From local path");
    lines.push("claude plugin install --local ./my-plugin");
    lines.push("```");
    lines.push("");

    lines.push("## Flags");
    lines.push("");
    lines.push("| Flag | Description |");
    lines.push("| --- | --- |");
    lines.push("| `--scope <user\\|project>` | Installation scope |");
    lines.push("| `--local` | Install from local path |");
    lines.push("| `--force` | Force reinstall |");

    return lines.join("\n");
  }
}
