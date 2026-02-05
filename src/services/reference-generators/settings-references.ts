import { BaseReferenceGenerator } from "./base-generator.ts";
import { ReferenceManager } from "../reference-manager.ts";

export class SettingsReferenceGenerator extends BaseReferenceGenerator {
  constructor(refManager: ReferenceManager) {
    super(refManager, {
      category: "settings",
      sourceUrls: ["settings.md", "model-config.md"],
    });
  }

  async generate(): Promise<void> {
    const contents = await this.fetchAllSources();
    await this.generateFromContent(contents);
  }

  async generateFromContent(contents: Map<string, string>): Promise<void> {
    const settingsMd = contents.get("settings.md") || "";
    const modelMd = contents.get("model-config.md") || "";

    await this.writeReference(
      "settings-reference.md",
      "Settings Reference",
      this.generateSettingsReference(settingsMd)
    );

    await this.writeReference(
      "settings-locations.md",
      "Settings Locations",
      this.generateSettingsLocations(settingsMd)
    );

    await this.writeReference(
      "model-configuration.md",
      "Model Configuration",
      this.generateModelConfiguration(modelMd)
    );
  }

  generateSettingsReference(content: string): string {
    const lines: string[] = [];
    lines.push("# Settings Reference");
    lines.push("");
    lines.push("Claude Code configuration options.");
    lines.push("");

    lines.push("## Core Settings");
    lines.push("");
    lines.push("| Setting | Type | Default | Description |");
    lines.push("| --- | --- | --- | --- |");
    lines.push("| `model` | string | sonnet | Default model to use |");
    lines.push("| `customApiKeyResponsibility` | boolean | false | Use custom API key |");
    lines.push("| `disableAllHooks` | boolean | false | Disable all hooks |");
    lines.push("| `allowManagedHooksOnly` | boolean | false | Enterprise only |");
    lines.push("");

    lines.push("## Permission Settings");
    lines.push("");
    lines.push("| Setting | Type | Description |");
    lines.push("| --- | --- | --- |");
    lines.push("| `permissions.allow` | array | Allowed permission patterns |");
    lines.push("| `permissions.deny` | array | Denied permission patterns |");
    lines.push("");

    lines.push("## Example Configuration");
    lines.push("");
    lines.push("```json");
    lines.push("{");
    lines.push('  "model": "opus",');
    lines.push('  "permissions": {');
    lines.push('    "allow": [');
    lines.push('      "Bash(npm:*)",');
    lines.push('      "Edit(src/**)"');
    lines.push("    ]");
    lines.push("  }");
    lines.push("}");
    lines.push("```");

    return lines.join("\n");
  }

  generateSettingsLocations(content: string): string {
    const lines: string[] = [];
    lines.push("# Settings Locations");
    lines.push("");
    lines.push("Where settings files are stored and their precedence.");
    lines.push("");

    lines.push("## Location Reference");
    lines.push("");
    lines.push("| Location | Scope | Shareable |");
    lines.push("| --- | --- | --- |");
    lines.push("| `~/.claude/settings.json` | Global | No |");
    lines.push("| `.claude/settings.json` | Project | Yes (commit) |");
    lines.push("| `.claude/settings.local.json` | Project | No (gitignored) |");
    lines.push("| Managed policy | Organization | Admin-controlled |");
    lines.push("");

    lines.push("## Precedence Order");
    lines.push("");
    lines.push("Later settings override earlier:");
    lines.push("");
    lines.push("1. Default settings");
    lines.push("2. Global settings (`~/.claude/settings.json`)");
    lines.push("3. Project settings (`.claude/settings.json`)");
    lines.push("4. Local settings (`.claude/settings.local.json`)");
    lines.push("5. Managed policy settings");
    lines.push("");

    lines.push("## Creating Settings");
    lines.push("");
    lines.push("```bash");
    lines.push("# Create project settings directory");
    lines.push("mkdir -p .claude");
    lines.push("");
    lines.push("# Create settings file");
    lines.push("echo '{}' > .claude/settings.json");
    lines.push("```");

    return lines.join("\n");
  }

  generateModelConfiguration(content: string): string {
    const lines: string[] = [];
    lines.push("# Model Configuration");
    lines.push("");
    lines.push("Configure which Claude models to use.");
    lines.push("");

    lines.push("## Model Aliases");
    lines.push("");
    lines.push("| Alias | Description |");
    lines.push("| --- | --- |");
    lines.push("| `haiku` | Fast, efficient model |");
    lines.push("| `sonnet` | Balanced model (default) |");
    lines.push("| `opus` | Most capable model |");
    lines.push("| `opusplan` | Opus for planning, Sonnet for execution |");
    lines.push("");

    lines.push("## Setting the Model");
    lines.push("");
    lines.push("Via CLI flag:");
    lines.push("");
    lines.push("```bash");
    lines.push("claude --model opus");
    lines.push("```");
    lines.push("");
    lines.push("Via settings:");
    lines.push("");
    lines.push("```json");
    lines.push("{");
    lines.push('  "model": "opus"');
    lines.push("}");
    lines.push("```");
    lines.push("");

    lines.push("## Provider Configuration");
    lines.push("");
    lines.push("| Provider | Environment Variable |");
    lines.push("| --- | --- |");
    lines.push("| Anthropic | `ANTHROPIC_API_KEY` |");
    lines.push("| AWS Bedrock | `CLAUDE_CODE_USE_BEDROCK=1` |");
    lines.push("| Google Vertex | `CLAUDE_CODE_USE_VERTEX=1` |");

    return lines.join("\n");
  }
}
