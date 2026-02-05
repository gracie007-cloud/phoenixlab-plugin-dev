import { BaseReferenceGenerator } from "./base-generator.ts";
import { ReferenceManager } from "../reference-manager.ts";

export class MemoryReferenceGenerator extends BaseReferenceGenerator {
  constructor(refManager: ReferenceManager) {
    super(refManager, {
      category: "memory",
      sourceUrls: ["memory.md"],
    });
  }

  async generate(): Promise<void> {
    const contents = await this.fetchAllSources();
    await this.generateFromContent(contents);
  }

  async generateFromContent(contents: Map<string, string>): Promise<void> {
    const memoryMd = contents.get("memory.md") || "";

    await this.writeReference(
      "memory-locations.md",
      "Memory Locations",
      this.generateMemoryLocations(memoryMd)
    );

    await this.writeReference(
      "claude-md.md",
      "CLAUDE.md Format",
      this.generateClaudeMdFormat(memoryMd)
    );
  }

  generateMemoryLocations(content: string): string {
    const lines: string[] = [];
    lines.push("# Memory Locations");
    lines.push("");
    lines.push("Where Claude Code stores and loads memory.");
    lines.push("");

    lines.push("## Location Reference");
    lines.push("");
    lines.push("| Location | Scope | Purpose |");
    lines.push("| --- | --- | --- |");
    lines.push("| `~/.claude/CLAUDE.md` | Global | Personal preferences |");
    lines.push("| `./CLAUDE.md` | Project | Project instructions |");
    lines.push("| `.claude/settings.json` | Project | Project settings |");
    lines.push("| `~/.claude/memory/` | Global | Auto-memory directory |");
    lines.push("");

    lines.push("## Load Order");
    lines.push("");
    lines.push("1. Global CLAUDE.md (`~/.claude/CLAUDE.md`)");
    lines.push("2. Project CLAUDE.md (`./CLAUDE.md`)");
    lines.push("3. Project settings (`.claude/settings.json`)");
    lines.push("");

    lines.push("## Auto-Memory");
    lines.push("");
    lines.push("Claude can write to auto-memory directory:");
    lines.push("");
    lines.push("```");
    lines.push("~/.claude/projects/<project-hash>/memory/");
    lines.push("├── MEMORY.md           # Auto-loaded (first 200 lines)");
    lines.push("└── <topic>.md          # Referenced from MEMORY.md");
    lines.push("```");
    lines.push("");

    lines.push("## Memory Priority");
    lines.push("");
    lines.push("More specific locations override general ones:");
    lines.push("Project > User > Default");

    return lines.join("\n");
  }

  generateClaudeMdFormat(content: string): string {
    const lines: string[] = [];
    lines.push("# CLAUDE.md Format");
    lines.push("");
    lines.push("Project instructions and context for Claude Code.");
    lines.push("");

    lines.push("## Purpose");
    lines.push("");
    lines.push("CLAUDE.md provides static context to Claude:");
    lines.push("");
    lines.push("- Project-specific instructions");
    lines.push("- Coding conventions");
    lines.push("- Architecture overview");
    lines.push("- Common commands");
    lines.push("");

    lines.push("## Format");
    lines.push("");
    lines.push("Plain markdown with headers for organization:");
    lines.push("");
    lines.push("```markdown");
    lines.push("# Project Name");
    lines.push("");
    lines.push("Brief description of the project.");
    lines.push("");
    lines.push("## Architecture");
    lines.push("");
    lines.push("Key architectural decisions...");
    lines.push("");
    lines.push("## Commands");
    lines.push("");
    lines.push("```bash");
    lines.push("npm test    # Run tests");
    lines.push("npm build   # Build project");
    lines.push("```");
    lines.push("```");
    lines.push("");

    lines.push("## Best Practices");
    lines.push("");
    lines.push("- Keep it concise (auto-loaded into context)");
    lines.push("- Focus on what Claude needs to know");
    lines.push("- Include common commands and patterns");
    lines.push("- Update when project conventions change");
    lines.push("");

    lines.push("## Locations");
    lines.push("");
    lines.push("| Location | Scope |");
    lines.push("| --- | --- |");
    lines.push("| `./CLAUDE.md` | Project root (most common) |");
    lines.push("| `~/.claude/CLAUDE.md` | Global preferences |");

    return lines.join("\n");
  }
}
