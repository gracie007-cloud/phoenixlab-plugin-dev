import { BaseReferenceGenerator } from "./base-generator.ts";
import { ReferenceManager } from "../reference-manager.ts";

export class ExecutionReferenceGenerator extends BaseReferenceGenerator {
  constructor(refManager: ReferenceManager) {
    super(refManager, {
      category: "execution",
      sourceUrls: ["sandboxing.md", "permissions.md", "devcontainer.md"],
    });
  }

  async generate(): Promise<void> {
    const contents = await this.fetchAllSources();
    await this.generateFromContent(contents);
  }

  async generateFromContent(contents: Map<string, string>): Promise<void> {
    const sandboxingMd = contents.get("sandboxing.md") || "";
    const permissionsMd = contents.get("permissions.md") || "";

    await this.writeReference(
      "sandboxing.md",
      "Sandboxing",
      this.generateSandboxing(sandboxingMd)
    );

    await this.writeReference(
      "permissions.md",
      "Permissions",
      this.generatePermissions(permissionsMd)
    );
  }

  generateSandboxing(content: string): string {
    const lines: string[] = [];
    lines.push("# Sandboxing");
    lines.push("");
    lines.push("Filesystem and network isolation for Bash commands.");
    lines.push("");

    lines.push("## Sandbox Modes");
    lines.push("");
    lines.push("| Mode | Description |");
    lines.push("| --- | --- |");
    lines.push("| `off` | No sandboxing (default) |");
    lines.push("| `permissive` | Warnings only |");
    lines.push("| `strict` | Block violations |");
    lines.push("");

    lines.push("## Configuration");
    lines.push("");
    lines.push("```json");
    lines.push("{");
    lines.push('  "sandbox": {');
    lines.push('    "mode": "strict",');
    lines.push('    "allowedPaths": ["/tmp", "$HOME/projects"],');
    lines.push('    "allowNetwork": false');
    lines.push("  }");
    lines.push("}");
    lines.push("```");
    lines.push("");

    lines.push("## Capabilities");
    lines.push("");
    lines.push("| Capability | Default | Description |");
    lines.push("| --- | --- | --- |");
    lines.push("| Filesystem read | Allowed | Read files in allowed paths |");
    lines.push("| Filesystem write | Allowed | Write to allowed paths |");
    lines.push("| Network | Blocked | Network access |");
    lines.push("| Process spawn | Allowed | Spawn child processes |");

    return lines.join("\n");
  }

  generatePermissions(content: string): string {
    const lines: string[] = [];
    lines.push("# Permissions");
    lines.push("");
    lines.push("Control what Claude Code can access and do.");
    lines.push("");

    lines.push("## Permission Modes");
    lines.push("");
    lines.push("| Mode | Description |");
    lines.push("| --- | --- |");
    lines.push("| `default` | Ask for permission each time |");
    lines.push("| `plan` | Approve high-level plans |");
    lines.push("| `acceptEdits` | Auto-approve file edits |");
    lines.push("| `dontAsk` | Auto-approve all |");
    lines.push("| `bypassPermissions` | Skip all checks |");
    lines.push("");

    lines.push("## Permission Rules");
    lines.push("");
    lines.push("```json");
    lines.push("{");
    lines.push('  "permissions": {');
    lines.push('    "allow": [');
    lines.push('      "Bash(npm:*)",');
    lines.push('      "Edit(src/**)",');
    lines.push('      "Read(*)"');
    lines.push("    ],");
    lines.push('    "deny": [');
    lines.push('      "Bash(rm -rf *)",');
    lines.push('      "Edit(.env)"');
    lines.push("    ]");
    lines.push("  }");
    lines.push("}");
    lines.push("```");
    lines.push("");

    lines.push("## Pattern Syntax");
    lines.push("");
    lines.push("| Pattern | Description |");
    lines.push("| --- | --- |");
    lines.push("| `Tool(*)` | Any argument |");
    lines.push("| `Tool(path/**)` | Recursive glob |");
    lines.push("| `Tool(cmd:*)` | Command prefix |");

    return lines.join("\n");
  }
}
