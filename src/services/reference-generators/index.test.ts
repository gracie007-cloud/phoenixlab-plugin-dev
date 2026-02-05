import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import {
  ReferenceGeneratorOrchestrator,
  ALL_CATEGORIES,
  type GeneratorCategory,
} from "./index.ts";
import { ReferenceManager } from "../reference-manager.ts";
import { mkdir, rm, exists } from "node:fs/promises";
import { join } from "node:path";

describe("ReferenceGeneratorOrchestrator", () => {
  const testReferencesDir = "/tmp/phoenixlab-orchestrator-test";
  let orchestrator: ReferenceGeneratorOrchestrator;
  let refManager: ReferenceManager;
  const originalFetch = globalThis.fetch;

  // Mock documentation response
  const MOCK_DOC_CONTENT = `# Mock Documentation

Some content here.

| Field | Description |
| --- | --- |
| name | The name |
| value | The value |
`;

  beforeEach(async () => {
    await rm(testReferencesDir, { recursive: true, force: true });
    await mkdir(testReferencesDir, { recursive: true });
    refManager = new ReferenceManager(testReferencesDir);
    orchestrator = new ReferenceGeneratorOrchestrator(refManager);

    // Mock all fetch calls
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(MOCK_DOC_CONTENT, { status: 200 }))
    );
  });

  afterEach(async () => {
    await rm(testReferencesDir, { recursive: true, force: true });
    globalThis.fetch = originalFetch;
  });

  describe("getGenerator", () => {
    it("should return correct generator for each category", () => {
      for (const category of ALL_CATEGORIES) {
        const generator = orchestrator.getGenerator(category);
        expect(generator).toBeDefined();
      }
    });

    it("should throw for unknown category", () => {
      expect(() =>
        orchestrator.getGenerator("unknown" as GeneratorCategory)
      ).toThrow("Unknown generator category");
    });
  });

  describe("generateCategory", () => {
    it("should generate files for a single category", async () => {
      const result = await orchestrator.generateCategory("hooks");

      expect(result.success).toBe(true);
      expect(result.category).toBe("hooks");
      expect(result.filesGenerated).toBeGreaterThan(0);
    });

    it("should return error result on failure", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response("Not Found", { status: 404 }))
      );

      const result = await orchestrator.generateCategory("hooks");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should clear existing category files before generating", async () => {
      // Generate first
      await orchestrator.generateCategory("hooks");

      // Create an extra file that should be removed
      await refManager.writeReference({
        path: "hooks/extra-file.md",
        topic: "Extra",
        content: "Should be removed",
        lastUpdated: new Date(),
      });

      // Regenerate
      await orchestrator.generateCategory("hooks");

      const files = await refManager.listReferences();
      expect(files).not.toContain("hooks/extra-file.md");
    });
  });

  describe("generateAll", () => {
    it("should generate files for all categories", async () => {
      const results = await orchestrator.generateAll();

      expect(results).toHaveLength(ALL_CATEGORIES.length);

      for (const result of results) {
        expect(result.success).toBe(true);
      }
    });

    it("should generate index.md", async () => {
      await orchestrator.generateAll();

      const indexPath = join(testReferencesDir, "index.md");
      expect(await exists(indexPath)).toBe(true);
    });
  });

  describe("generateMultiple", () => {
    it("should generate only specified categories", async () => {
      const categories: GeneratorCategory[] = ["hooks", "plugins"];
      const results = await orchestrator.generateMultiple(categories);

      expect(results).toHaveLength(2);
      expect(results.map((r) => r.category)).toEqual(categories);
    });

    it("should regenerate index after generating", async () => {
      await orchestrator.generateMultiple(["hooks"]);

      const indexPath = join(testReferencesDir, "index.md");
      expect(await exists(indexPath)).toBe(true);
    });
  });

  describe("ALL_CATEGORIES", () => {
    it("should contain all expected categories", () => {
      expect(ALL_CATEGORIES).toContain("hooks");
      expect(ALL_CATEGORIES).toContain("plugins");
      expect(ALL_CATEGORIES).toContain("skills");
      expect(ALL_CATEGORIES).toContain("mcp");
      expect(ALL_CATEGORIES).toContain("cli");
      expect(ALL_CATEGORIES).toContain("memory");
      expect(ALL_CATEGORIES).toContain("settings");
      expect(ALL_CATEGORIES).toContain("execution");
      expect(ALL_CATEGORIES).toContain("subagents");
      expect(ALL_CATEGORIES).toContain("output");
      expect(ALL_CATEGORIES).toContain("integrations");
    });
  });
});
