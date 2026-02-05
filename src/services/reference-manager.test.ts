import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { ReferenceManager, type ReferenceFile } from "./reference-manager.ts";
import { mkdir, rm, readFile, exists } from "node:fs/promises";
import { join } from "node:path";

describe("ReferenceManager", () => {
  const testReferencesDir = "/tmp/phoenixlab-plugin-dev-test-references";
  let manager: ReferenceManager;

  beforeEach(async () => {
    await rm(testReferencesDir, { recursive: true, force: true });
    await mkdir(testReferencesDir, { recursive: true });
    manager = new ReferenceManager(testReferencesDir);
  });

  afterEach(async () => {
    await rm(testReferencesDir, { recursive: true, force: true });
  });

  describe("writeReference", () => {
    it("should write a reference file to a simple path", async () => {
      const ref: ReferenceFile = {
        path: "index.md",
        topic: "Overview",
        content: "# Overview\n\nThis is the index.",
        lastUpdated: new Date("2024-01-15"),
      };

      await manager.writeReference(ref);

      const filePath = join(testReferencesDir, "index.md");
      expect(await exists(filePath)).toBe(true);
      const content = await readFile(filePath, "utf-8");
      expect(content).toBe("# Overview\n\nThis is the index.");
    });

    it("should write a reference file to a nested path", async () => {
      const ref: ReferenceFile = {
        path: "plugins/manifest-schema.md",
        topic: "Plugin Manifest Schema",
        content: "# Plugin Manifest\n\nSchema details.",
        lastUpdated: new Date("2024-01-15"),
      };

      await manager.writeReference(ref);

      const filePath = join(testReferencesDir, "plugins", "manifest-schema.md");
      expect(await exists(filePath)).toBe(true);
      const content = await readFile(filePath, "utf-8");
      expect(content).toBe("# Plugin Manifest\n\nSchema details.");
    });

    it("should create intermediate directories as needed", async () => {
      const ref: ReferenceFile = {
        path: "hooks/deep/nested/file.md",
        topic: "Nested Topic",
        content: "Content",
        lastUpdated: new Date("2024-01-15"),
      };

      await manager.writeReference(ref);

      const filePath = join(testReferencesDir, "hooks", "deep", "nested", "file.md");
      expect(await exists(filePath)).toBe(true);
    });

    it("should overwrite existing files", async () => {
      const ref1: ReferenceFile = {
        path: "test.md",
        topic: "Test",
        content: "Original content",
        lastUpdated: new Date("2024-01-15"),
      };
      const ref2: ReferenceFile = {
        path: "test.md",
        topic: "Test",
        content: "Updated content",
        lastUpdated: new Date("2024-01-16"),
      };

      await manager.writeReference(ref1);
      await manager.writeReference(ref2);

      const filePath = join(testReferencesDir, "test.md");
      const content = await readFile(filePath, "utf-8");
      expect(content).toBe("Updated content");
    });
  });

  describe("readReference", () => {
    it("should read an existing reference file", async () => {
      const ref: ReferenceFile = {
        path: "plugins/manifest-schema.md",
        topic: "Plugin Manifest Schema",
        content: "# Plugin Manifest\n\nSchema details.",
        lastUpdated: new Date("2024-01-15"),
      };
      await manager.writeReference(ref);

      const result = await manager.readReference("plugins/manifest-schema.md");

      expect(result).not.toBeNull();
      expect(result!.path).toBe("plugins/manifest-schema.md");
      expect(result!.content).toBe("# Plugin Manifest\n\nSchema details.");
    });

    it("should return null for non-existent file", async () => {
      const result = await manager.readReference("non-existent.md");

      expect(result).toBeNull();
    });

    it("should extract topic from first heading", async () => {
      const ref: ReferenceFile = {
        path: "test.md",
        topic: "My Topic",
        content: "# Custom Topic\n\nContent here.",
        lastUpdated: new Date("2024-01-15"),
      };
      await manager.writeReference(ref);

      const result = await manager.readReference("test.md");

      expect(result!.topic).toBe("Custom Topic");
    });

    it("should use filename as topic when no heading found", async () => {
      const ref: ReferenceFile = {
        path: "no-heading.md",
        topic: "No Heading",
        content: "Just some content without a heading.",
        lastUpdated: new Date("2024-01-15"),
      };
      await manager.writeReference(ref);

      const result = await manager.readReference("no-heading.md");

      expect(result!.topic).toBe("no-heading");
    });
  });

  describe("listReferences", () => {
    it("should return empty array for empty directory", async () => {
      const result = await manager.listReferences();

      expect(result).toEqual([]);
    });

    it("should list all markdown files recursively", async () => {
      await manager.writeReference({
        path: "index.md",
        topic: "Index",
        content: "Index content",
        lastUpdated: new Date(),
      });
      await manager.writeReference({
        path: "plugins/manifest-schema.md",
        topic: "Manifest",
        content: "Manifest content",
        lastUpdated: new Date(),
      });
      await manager.writeReference({
        path: "hooks/events-overview.md",
        topic: "Events",
        content: "Events content",
        lastUpdated: new Date(),
      });

      const result = await manager.listReferences();

      expect(result).toContain("index.md");
      expect(result).toContain("plugins/manifest-schema.md");
      expect(result).toContain("hooks/events-overview.md");
      expect(result).toHaveLength(3);
    });

    it("should only list markdown files", async () => {
      await manager.writeReference({
        path: "test.md",
        topic: "Test",
        content: "Test content",
        lastUpdated: new Date(),
      });
      // Write a non-markdown file directly
      const nonMdPath = join(testReferencesDir, "test.json");
      await Bun.write(nonMdPath, JSON.stringify({ test: true }));

      const result = await manager.listReferences();

      expect(result).toEqual(["test.md"]);
    });

    it("should return paths relative to references directory", async () => {
      await manager.writeReference({
        path: "plugins/deeply/nested/file.md",
        topic: "Nested",
        content: "Content",
        lastUpdated: new Date(),
      });

      const result = await manager.listReferences();

      expect(result).toContain("plugins/deeply/nested/file.md");
    });
  });

  describe("generateIndex", () => {
    it("should generate index.md with links to all references", async () => {
      await manager.writeReference({
        path: "plugins/manifest-schema.md",
        topic: "Plugin Manifest Schema",
        content: "# Plugin Manifest Schema\n\nContent",
        lastUpdated: new Date(),
      });
      await manager.writeReference({
        path: "hooks/events-overview.md",
        topic: "Hook Events",
        content: "# Hook Events\n\nContent",
        lastUpdated: new Date(),
      });

      await manager.generateIndex();

      const indexPath = join(testReferencesDir, "index.md");
      expect(await exists(indexPath)).toBe(true);
      const content = await readFile(indexPath, "utf-8");
      expect(content).toContain("# Reference Index");
      expect(content).toContain("[Plugin Manifest Schema](./plugins/manifest-schema.md)");
      expect(content).toContain("[Hook Events](./hooks/events-overview.md)");
    });

    it("should organize references by category", async () => {
      await manager.writeReference({
        path: "plugins/manifest-schema.md",
        topic: "Plugin Manifest Schema",
        content: "# Plugin Manifest Schema\n\nContent",
        lastUpdated: new Date(),
      });
      await manager.writeReference({
        path: "plugins/component-types.md",
        topic: "Component Types",
        content: "# Component Types\n\nContent",
        lastUpdated: new Date(),
      });
      await manager.writeReference({
        path: "hooks/events-overview.md",
        topic: "Hook Events",
        content: "# Hook Events\n\nContent",
        lastUpdated: new Date(),
      });

      await manager.generateIndex();

      const indexPath = join(testReferencesDir, "index.md");
      const content = await readFile(indexPath, "utf-8");
      expect(content).toContain("## plugins");
      expect(content).toContain("## hooks");
    });

    it("should handle empty references directory", async () => {
      await manager.generateIndex();

      const indexPath = join(testReferencesDir, "index.md");
      expect(await exists(indexPath)).toBe(true);
      const content = await readFile(indexPath, "utf-8");
      expect(content).toContain("# Reference Index");
    });
  });

  describe("deleteReference", () => {
    it("should delete an existing reference file", async () => {
      await manager.writeReference({
        path: "test.md",
        topic: "Test",
        content: "Content",
        lastUpdated: new Date(),
      });

      const deleted = await manager.deleteReference("test.md");

      expect(deleted).toBe(true);
      const filePath = join(testReferencesDir, "test.md");
      expect(await exists(filePath)).toBe(false);
    });

    it("should return false for non-existent file", async () => {
      const deleted = await manager.deleteReference("non-existent.md");

      expect(deleted).toBe(false);
    });
  });

  describe("clearCategory", () => {
    it("should delete all files in a category", async () => {
      await manager.writeReference({
        path: "hooks/events.md",
        topic: "Events",
        content: "Content",
        lastUpdated: new Date(),
      });
      await manager.writeReference({
        path: "hooks/patterns.md",
        topic: "Patterns",
        content: "Content",
        lastUpdated: new Date(),
      });
      await manager.writeReference({
        path: "plugins/manifest.md",
        topic: "Manifest",
        content: "Content",
        lastUpdated: new Date(),
      });

      await manager.clearCategory("hooks");

      const hooksPath = join(testReferencesDir, "hooks");
      expect(await exists(hooksPath)).toBe(false);
      const pluginsPath = join(testReferencesDir, "plugins", "manifest.md");
      expect(await exists(pluginsPath)).toBe(true);
    });

    it("should handle non-existent category gracefully", async () => {
      // Should not throw
      await manager.clearCategory("non-existent");
    });
  });
});
