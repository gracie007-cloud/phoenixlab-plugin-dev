import { ReferenceManager } from "../reference-manager.ts";
import { HookReferenceGenerator } from "./hook-references.ts";
import { PluginReferenceGenerator } from "./plugin-references.ts";
import { SkillReferenceGenerator } from "./skill-references.ts";
import { MCPReferenceGenerator } from "./mcp-references.ts";
import { CLIReferenceGenerator } from "./cli-references.ts";
import { MemoryReferenceGenerator } from "./memory-references.ts";
import { SettingsReferenceGenerator } from "./settings-references.ts";
import { ExecutionReferenceGenerator } from "./execution-references.ts";
import { SubagentReferenceGenerator } from "./subagent-references.ts";
import { OutputReferenceGenerator } from "./output-references.ts";
import { IntegrationReferenceGenerator } from "./integration-references.ts";

export type GeneratorCategory =
  | "hooks"
  | "plugins"
  | "skills"
  | "mcp"
  | "cli"
  | "memory"
  | "settings"
  | "execution"
  | "subagents"
  | "output"
  | "integrations";

export const ALL_CATEGORIES: GeneratorCategory[] = [
  "hooks",
  "plugins",
  "skills",
  "mcp",
  "cli",
  "memory",
  "settings",
  "execution",
  "subagents",
  "output",
  "integrations",
];

export interface GeneratorResult {
  category: GeneratorCategory;
  success: boolean;
  filesGenerated?: number;
  error?: string;
}

export class ReferenceGeneratorOrchestrator {
  constructor(private refManager: ReferenceManager) {}

  getGenerator(category: GeneratorCategory) {
    switch (category) {
      case "hooks":
        return new HookReferenceGenerator(this.refManager);
      case "plugins":
        return new PluginReferenceGenerator(this.refManager);
      case "skills":
        return new SkillReferenceGenerator(this.refManager);
      case "mcp":
        return new MCPReferenceGenerator(this.refManager);
      case "cli":
        return new CLIReferenceGenerator(this.refManager);
      case "memory":
        return new MemoryReferenceGenerator(this.refManager);
      case "settings":
        return new SettingsReferenceGenerator(this.refManager);
      case "execution":
        return new ExecutionReferenceGenerator(this.refManager);
      case "subagents":
        return new SubagentReferenceGenerator(this.refManager);
      case "output":
        return new OutputReferenceGenerator(this.refManager);
      case "integrations":
        return new IntegrationReferenceGenerator(this.refManager);
      default:
        throw new Error(`Unknown generator category: ${category}`);
    }
  }

  async generateCategory(category: GeneratorCategory): Promise<GeneratorResult> {
    try {
      // Clear existing files for this category
      await this.refManager.clearCategory(category);

      // Generate new files
      const generator = this.getGenerator(category);
      await generator.generate();

      // Count generated files
      const files = await this.refManager.listReferences();
      const categoryFiles = files.filter((f) => f.startsWith(`${category}/`));

      return {
        category,
        success: true,
        filesGenerated: categoryFiles.length,
      };
    } catch (error) {
      return {
        category,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async generateAll(): Promise<GeneratorResult[]> {
    const results: GeneratorResult[] = [];

    for (const category of ALL_CATEGORIES) {
      const result = await this.generateCategory(category);
      results.push(result);
    }

    // Generate the index after all categories
    await this.refManager.generateIndex();

    return results;
  }

  async generateMultiple(categories: GeneratorCategory[]): Promise<GeneratorResult[]> {
    const results: GeneratorResult[] = [];

    for (const category of categories) {
      const result = await this.generateCategory(category);
      results.push(result);
    }

    // Regenerate index
    await this.refManager.generateIndex();

    return results;
  }
}

// Re-export all generators for direct use
export { HookReferenceGenerator } from "./hook-references.ts";
export { PluginReferenceGenerator } from "./plugin-references.ts";
export { SkillReferenceGenerator } from "./skill-references.ts";
export { MCPReferenceGenerator } from "./mcp-references.ts";
export { CLIReferenceGenerator } from "./cli-references.ts";
export { MemoryReferenceGenerator } from "./memory-references.ts";
export { SettingsReferenceGenerator } from "./settings-references.ts";
export { ExecutionReferenceGenerator } from "./execution-references.ts";
export { SubagentReferenceGenerator } from "./subagent-references.ts";
export { OutputReferenceGenerator } from "./output-references.ts";
export { IntegrationReferenceGenerator } from "./integration-references.ts";
