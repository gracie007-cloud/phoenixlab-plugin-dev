import { BaseReferenceGenerator } from "./base-generator.ts";
import { ReferenceManager } from "../reference-manager.ts";

export class SubagentReferenceGenerator extends BaseReferenceGenerator {
  constructor(refManager: ReferenceManager) {
    super(refManager, {
      category: "subagents",
      sourceUrls: ["sub-agents.md"],
    });
  }

  async generate(): Promise<void> {
    const contents = await this.fetchAllSources();
    await this.generateFromContent(contents);
  }

  async generateFromContent(contents: Map<string, string>): Promise<void> {
    const subagentsMd = contents.get("sub-agents.md") || "";

    await this.writeReference(
      "built-in-agents.md",
      "Built-in Agents",
      this.generateBuiltInAgents(subagentsMd)
    );

    await this.writeReference(
      "custom-agents.md",
      "Custom Agents",
      this.generateCustomAgents(subagentsMd)
    );
  }

  generateBuiltInAgents(content: string): string {
    const lines: string[] = [];
    lines.push("# Built-in Agents");
    lines.push("");
    lines.push("Specialized agents available in Claude Code.");
    lines.push("");

    lines.push("## Agent Reference");
    lines.push("");
    lines.push("| Agent | Purpose | Available Tools |");
    lines.push("| --- | --- | --- |");
    lines.push("| `Bash` | Command execution | Bash only |");
    lines.push("| `Explore` | Codebase exploration | Read, Glob, Grep |");
    lines.push("| `Plan` | Implementation planning | Read, Glob, Grep |");
    lines.push("| `general-purpose` | General tasks | All tools |");
    lines.push("");

    lines.push("## Using Built-in Agents");
    lines.push("");
    lines.push("Via Task tool:");
    lines.push("");
    lines.push("```json");
    lines.push("{");
    lines.push('  "subagent_type": "Explore",');
    lines.push('  "prompt": "Find all API endpoints"');
    lines.push("}");
    lines.push("```");
    lines.push("");

    lines.push("## Agent Capabilities");
    lines.push("");
    lines.push("### Explore Agent");
    lines.push("");
    lines.push("- Fast codebase search");
    lines.push("- File pattern matching");
    lines.push("- Content searching");
    lines.push("");
    lines.push("### Plan Agent");
    lines.push("");
    lines.push("- Implementation planning");
    lines.push("- Architecture analysis");
    lines.push("- Step-by-step breakdowns");

    return lines.join("\n");
  }

  generateCustomAgents(content: string): string {
    const lines: string[] = [];
    lines.push("# Custom Agents");
    lines.push("");
    lines.push("Create custom subagent configurations.");
    lines.push("");

    lines.push("## Agent Definition");
    lines.push("");
    lines.push("Create `.claude/agents/<name>.md`:");
    lines.push("");
    lines.push("```yaml");
    lines.push("---");
    lines.push("name: code-reviewer");
    lines.push("description: Reviews code for issues");
    lines.push("model: sonnet");
    lines.push("maxTurns: 20");
    lines.push("allowedTools:");
    lines.push("  - Read");
    lines.push("  - Grep");
    lines.push("  - Glob");
    lines.push("---");
    lines.push("");
    lines.push("Review the code for...");
    lines.push("```");
    lines.push("");

    lines.push("## Agent Fields");
    lines.push("");
    lines.push("| Field | Type | Description |");
    lines.push("| --- | --- | --- |");
    lines.push("| `name` | string | Agent identifier |");
    lines.push("| `description` | string | What the agent does |");
    lines.push("| `model` | string | Model alias |");
    lines.push("| `maxTurns` | number | Maximum conversation turns |");
    lines.push("| `allowedTools` | array | Restricted tool list |");
    lines.push("");

    lines.push("## Using Custom Agents");
    lines.push("");
    lines.push("```bash");
    lines.push("claude --agent code-reviewer");
    lines.push("```");
    lines.push("");

    lines.push("Or via Task tool:");
    lines.push("");
    lines.push("```json");
    lines.push("{");
    lines.push('  "subagent_type": "code-reviewer",');
    lines.push('  "prompt": "Review the auth module"');
    lines.push("}");
    lines.push("```");

    return lines.join("\n");
  }
}
