import { BaseReferenceGenerator } from "./base-generator.ts";
import { ReferenceManager } from "../reference-manager.ts";

export class SkillReferenceGenerator extends BaseReferenceGenerator {
  constructor(refManager: ReferenceManager) {
    super(refManager, {
      category: "skills",
      sourceUrls: ["skills.md"],
    });
  }

  async generate(): Promise<void> {
    const contents = await this.fetchAllSources();
    await this.generateFromContent(contents);
  }

  async generateFromContent(contents: Map<string, string>): Promise<void> {
    const skillsMd = contents.get("skills.md") || "";

    await this.writeReference(
      "frontmatter-reference.md",
      "Frontmatter Reference",
      this.generateFrontmatterReference(skillsMd)
    );

    await this.writeReference(
      "locations-priority.md",
      "Skill Locations",
      this.generateLocationsPriority(skillsMd)
    );

    await this.writeReference(
      "invocation-control.md",
      "Invocation Control",
      this.generateInvocationControl(skillsMd)
    );

    await this.writeReference(
      "arguments-substitution.md",
      "Arguments & Substitution",
      this.generateArgumentsSubstitution(skillsMd)
    );

    await this.writeReference(
      "subagent-execution.md",
      "Subagent Execution",
      this.generateSubagentExecution(skillsMd)
    );
  }

  generateFrontmatterReference(content: string): string {
    const lines: string[] = [];
    lines.push("# Frontmatter Reference");
    lines.push("");
    lines.push("YAML frontmatter fields for SKILL.md files.");
    lines.push("");

    lines.push("## Required Fields");
    lines.push("");
    lines.push("| Field | Type | Description |");
    lines.push("| --- | --- | --- |");
    lines.push("| `name` | string | Unique skill identifier |");
    lines.push("| `description` | string | What the skill does |");
    lines.push("");

    lines.push("## Optional Fields");
    lines.push("");
    lines.push("| Field | Type | Default | Description |");
    lines.push("| --- | --- | --- | --- |");
    lines.push("| `user-invocable` | boolean | false | User can invoke with /name |");
    lines.push("| `disable-model-invocation` | boolean | false | Prevent auto-invocation |");
    lines.push("| `arguments` | string | - | Expected arguments format |");
    lines.push("| `context` | string | - | Context handling (fork, inherit) |");
    lines.push("| `agent` | object | - | Subagent configuration |");
    lines.push("| `hooks` | object | - | Skill-scoped hooks |");
    lines.push("");

    lines.push("## Example");
    lines.push("");
    lines.push("```yaml");
    lines.push("---");
    lines.push("name: deploy");
    lines.push("description: Deploy the application");
    lines.push("user-invocable: true");
    lines.push("arguments: \"[environment]\"");
    lines.push("---");
    lines.push("");
    lines.push("Instructions for deploying...");
    lines.push("```");

    return lines.join("\n");
  }

  generateLocationsPriority(content: string): string {
    const lines: string[] = [];
    lines.push("# Skill Locations");
    lines.push("");
    lines.push("Where skills are loaded from and precedence order.");
    lines.push("");

    lines.push("## Location Reference");
    lines.push("");
    lines.push("| Location | Scope | Shareable |");
    lines.push("| --- | --- | --- |");
    lines.push("| `~/.claude/skills/` | All projects | No |");
    lines.push("| `.claude/skills/` | Current project | Yes (commit) |");
    lines.push("| Plugin `skills/` | When enabled | Yes (plugin) |");
    lines.push("");

    lines.push("## Directory Structure");
    lines.push("");
    lines.push("```");
    lines.push("skills/");
    lines.push("└── my-skill/");
    lines.push("    └── SKILL.md");
    lines.push("```");
    lines.push("");

    lines.push("## Precedence");
    lines.push("");
    lines.push("When skills have the same name:");
    lines.push("");
    lines.push("1. Project skills (`.claude/skills/`)");
    lines.push("2. Plugin skills");
    lines.push("3. User skills (`~/.claude/skills/`)");
    lines.push("");

    lines.push("## File Naming");
    lines.push("");
    lines.push("- Skill file must be named `SKILL.md`");
    lines.push("- Directory name becomes skill name if not specified");

    return lines.join("\n");
  }

  generateInvocationControl(content: string): string {
    const lines: string[] = [];
    lines.push("# Invocation Control");
    lines.push("");
    lines.push("Control how skills are invoked.");
    lines.push("");

    lines.push("## Invocation Methods");
    lines.push("");
    lines.push("| Method | Trigger | Control Field |");
    lines.push("| --- | --- | --- |");
    lines.push("| User | `/skillname` command | `user-invocable: true` |");
    lines.push("| Model | Claude auto-invokes | `disable-model-invocation: false` |");
    lines.push("");

    lines.push("## user-invocable");
    lines.push("");
    lines.push("When `true`, users can invoke with `/skillname`:");
    lines.push("");
    lines.push("```yaml");
    lines.push("---");
    lines.push("name: commit");
    lines.push("user-invocable: true");
    lines.push("---");
    lines.push("```");
    lines.push("");
    lines.push("User types `/commit` to invoke.");
    lines.push("");

    lines.push("## disable-model-invocation");
    lines.push("");
    lines.push("When `true`, Claude cannot auto-invoke the skill:");
    lines.push("");
    lines.push("```yaml");
    lines.push("---");
    lines.push("name: dangerous-op");
    lines.push("disable-model-invocation: true");
    lines.push("user-invocable: true");
    lines.push("---");
    lines.push("```");
    lines.push("");
    lines.push("Only user can invoke, Claude cannot trigger automatically.");

    return lines.join("\n");
  }

  generateArgumentsSubstitution(content: string): string {
    const lines: string[] = [];
    lines.push("# Arguments & Substitution");
    lines.push("");
    lines.push("Pass arguments to skills with substitution variables.");
    lines.push("");

    lines.push("## Arguments Field");
    lines.push("");
    lines.push("Document expected arguments:");
    lines.push("");
    lines.push("```yaml");
    lines.push("---");
    lines.push("name: greet");
    lines.push("arguments: \"<name> [greeting]\"");
    lines.push("user-invocable: true");
    lines.push("---");
    lines.push("```");
    lines.push("");

    lines.push("## $ARGUMENTS Substitution");
    lines.push("");
    lines.push("Use `$ARGUMENTS` in skill body:");
    lines.push("");
    lines.push("```yaml");
    lines.push("---");
    lines.push("name: search");
    lines.push("arguments: \"<query>\"");
    lines.push("---");
    lines.push("");
    lines.push("Search the codebase for: $ARGUMENTS");
    lines.push("```");
    lines.push("");
    lines.push("User invokes: `/search TODO comments`");
    lines.push("");
    lines.push("Result: \"Search the codebase for: TODO comments\"");
    lines.push("");

    lines.push("## Convention");
    lines.push("");
    lines.push("- `<required>` - Required argument");
    lines.push("- `[optional]` - Optional argument");

    return lines.join("\n");
  }

  generateSubagentExecution(content: string): string {
    const lines: string[] = [];
    lines.push("# Subagent Execution");
    lines.push("");
    lines.push("Run skills in isolated subagent contexts.");
    lines.push("");

    lines.push("## Context Modes");
    lines.push("");
    lines.push("| Mode | Behavior |");
    lines.push("| --- | --- |");
    lines.push("| (default) | Skill runs in main context |");
    lines.push("| `fork` | Skill runs in isolated subagent |");
    lines.push("");

    lines.push("## Fork Context");
    lines.push("");
    lines.push("```yaml");
    lines.push("---");
    lines.push("name: analyze");
    lines.push("context: fork");
    lines.push("---");
    lines.push("");
    lines.push("Analysis instructions...");
    lines.push("```");
    lines.push("");

    lines.push("## Agent Configuration");
    lines.push("");
    lines.push("Configure the subagent behavior:");
    lines.push("");
    lines.push("```yaml");
    lines.push("---");
    lines.push("name: research");
    lines.push("context: fork");
    lines.push("agent:");
    lines.push("  model: haiku       # Model to use");
    lines.push("  maxTurns: 10       # Max conversation turns");
    lines.push("  allowedTools:      # Restrict available tools");
    lines.push("    - Read");
    lines.push("    - Grep");
    lines.push("    - Glob");
    lines.push("---");
    lines.push("```");
    lines.push("");

    lines.push("## Agent Fields");
    lines.push("");
    lines.push("| Field | Type | Description |");
    lines.push("| --- | --- | --- |");
    lines.push("| `model` | string | Model alias (haiku, sonnet, opus) |");
    lines.push("| `maxTurns` | number | Maximum agent turns |");
    lines.push("| `allowedTools` | array | Restrict to specific tools |");

    return lines.join("\n");
  }
}
