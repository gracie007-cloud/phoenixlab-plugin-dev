import { mkdir, readFile, writeFile, rm, exists } from "node:fs/promises";
import { join, dirname, basename, relative } from "node:path";
import { Glob } from "bun";

export interface ReferenceFile {
  path: string;
  topic: string;
  content: string;
  lastUpdated: Date;
}

export class ReferenceManager {
  constructor(private referencesDir: string) {}

  async writeReference(ref: ReferenceFile): Promise<void> {
    const filePath = join(this.referencesDir, ref.path);
    const dir = dirname(filePath);

    await mkdir(dir, { recursive: true });
    await writeFile(filePath, ref.content);
  }

  async readReference(path: string): Promise<ReferenceFile | null> {
    const filePath = join(this.referencesDir, path);

    if (!(await exists(filePath))) {
      return null;
    }

    const content = await readFile(filePath, "utf-8");
    const topic = this.extractTopic(content, path);
    const stat = await Bun.file(filePath).stat();

    return {
      path,
      topic,
      content,
      lastUpdated: stat?.mtime ?? new Date(),
    };
  }

  async listReferences(): Promise<string[]> {
    const glob = new Glob("**/*.md");
    const files: string[] = [];

    for await (const file of glob.scan({ cwd: this.referencesDir })) {
      files.push(file);
    }

    return files.sort();
  }

  async generateIndex(): Promise<void> {
    const refs = await this.listReferences();
    const lines: string[] = [];

    lines.push("# Reference Index");
    lines.push("");
    lines.push("Progressive disclosure documentation for Claude Code plugin development.");
    lines.push("");

    // Group by category (first path segment)
    const byCategory = new Map<string, string[]>();

    for (const refPath of refs) {
      if (refPath === "index.md") continue;

      const parts = refPath.split("/");
      const category = parts.length > 1 ? parts[0] : "root";

      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      byCategory.get(category)!.push(refPath);
    }

    // Generate sections for each category
    const sortedCategories = Array.from(byCategory.keys()).sort();

    for (const category of sortedCategories) {
      const categoryRefs = byCategory.get(category)!;

      lines.push(`## ${category}`);
      lines.push("");

      for (const refPath of categoryRefs) {
        const ref = await this.readReference(refPath);
        if (ref) {
          lines.push(`- [${ref.topic}](./${refPath})`);
        }
      }

      lines.push("");
    }

    const indexPath = join(this.referencesDir, "index.md");
    await writeFile(indexPath, lines.join("\n"));
  }

  async deleteReference(path: string): Promise<boolean> {
    const filePath = join(this.referencesDir, path);

    if (!(await exists(filePath))) {
      return false;
    }

    await rm(filePath);
    return true;
  }

  async clearCategory(category: string): Promise<void> {
    const categoryPath = join(this.referencesDir, category);

    if (!(await exists(categoryPath))) {
      return;
    }

    await rm(categoryPath, { recursive: true });
  }

  private extractTopic(content: string, path: string): string {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }

    // Fall back to filename without extension
    return basename(path, ".md");
  }
}
