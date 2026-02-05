import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { PluginReferenceGenerator } from "./plugin-references.ts";
import { ReferenceManager } from "../reference-manager.ts";
import { mkdir, rm, readFile } from "node:fs/promises";
import { join } from "node:path";

describe("PluginReferenceGenerator", () => {
  const testReferencesDir = "/tmp/phoenixlab-plugin-refs-test";
  let generator: PluginReferenceGenerator;
  let refManager: ReferenceManager;
  const originalFetch = globalThis.fetch;

  const MOCK_PLUGINS_MD = `# Create plugins

Create custom plugins to extend Claude Code with skills, agents, hooks, and MCP servers.

## Plugin structure

A plugin is a directory containing:

\`\`\`
my-plugin/
├── .claude-plugin/
│   └── plugin.json         # Plugin manifest (required)
├── skills/                 # Skill files
│   └── my-skill/
│       └── SKILL.md
├── agents/                 # Custom agents
│   └── my-agent.md
├── hooks/                  # Hook configurations
│   └── hooks.json
└── .mcp/                   # MCP server configs
    └── mcp.json
\`\`\`

## Plugin manifest

The \`plugin.json\` file defines your plugin's metadata:

\`\`\`json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Your Name"
}
\`\`\`

| Field | Required | Description |
| --- | --- | --- |
| \`name\` | yes | Unique plugin identifier |
| \`version\` | yes | Semantic version |
| \`description\` | no | What the plugin does |
| \`author\` | no | Plugin author |

## Installation scopes

Plugins can be installed at different scopes:

| Scope | Location | Effect |
| --- | --- | --- |
| user | \`~/.claude/plugins/\` | Available in all projects |
| project | \`.claude/plugins/\` | Only in this project |
| local | Direct path reference | Development mode |
`;

  const MOCK_PLUGINS_REF_MD = `# Plugins reference

Complete technical reference for Claude Code plugin system.

## CLI commands

| Command | Description |
| --- | --- |
| \`claude plugin install <source>\` | Install a plugin |
| \`claude plugin uninstall <name>\` | Remove a plugin |
| \`claude plugin list\` | List installed plugins |
| \`claude plugin enable <name>\` | Enable a disabled plugin |
| \`claude plugin disable <name>\` | Disable a plugin |

## Component types

Plugins can include these components:

| Component | Directory | Description |
| --- | --- | --- |
| Skills | \`skills/\` | Extended instructions and commands |
| Agents | \`agents/\` | Custom subagent configurations |
| Hooks | \`hooks/hooks.json\` | Lifecycle event handlers |
| MCP | \`.mcp/mcp.json\` | MCP server configurations |
`;

  beforeEach(async () => {
    await rm(testReferencesDir, { recursive: true, force: true });
    await mkdir(testReferencesDir, { recursive: true });
    refManager = new ReferenceManager(testReferencesDir);
    generator = new PluginReferenceGenerator(refManager);
  });

  afterEach(async () => {
    await rm(testReferencesDir, { recursive: true, force: true });
    globalThis.fetch = originalFetch;
  });

  describe("generateManifestSchema", () => {
    it("should generate manifest schema reference", () => {
      const content = generator.generateManifestSchema(MOCK_PLUGINS_MD);

      expect(content).toContain("# Plugin Manifest Schema");
      expect(content).toContain("plugin.json");
      expect(content).toContain("name");
      expect(content).toContain("version");
    });
  });

  describe("generateComponentTypes", () => {
    it("should generate component types reference", () => {
      const content = generator.generateComponentTypes(MOCK_PLUGINS_REF_MD);

      expect(content).toContain("# Component Types");
      expect(content).toContain("Skills");
      expect(content).toContain("Agents");
      expect(content).toContain("Hooks");
    });
  });

  describe("generateDirectoryStructure", () => {
    it("should generate directory structure reference", () => {
      const content = generator.generateDirectoryStructure(MOCK_PLUGINS_MD);

      expect(content).toContain("# Directory Structure");
      expect(content).toContain("plugin.json");
      expect(content).toContain("skills/");
    });
  });

  describe("generateInstallationScopes", () => {
    it("should generate installation scopes reference", () => {
      const content = generator.generateInstallationScopes(MOCK_PLUGINS_MD);

      expect(content).toContain("# Installation Scopes");
      expect(content).toContain("user");
      expect(content).toContain("project");
    });
  });

  describe("generateCliCommands", () => {
    it("should generate CLI commands reference", () => {
      const content = generator.generateCliCommands(MOCK_PLUGINS_REF_MD);

      expect(content).toContain("# Plugin CLI Commands");
      expect(content).toContain("install");
      expect(content).toContain("uninstall");
    });
  });

  describe("generate", () => {
    it("should generate all plugin reference files", async () => {
      globalThis.fetch = mock((url: string) => {
        if (url.includes("plugins-reference")) {
          return Promise.resolve(new Response(MOCK_PLUGINS_REF_MD, { status: 200 }));
        }
        return Promise.resolve(new Response(MOCK_PLUGINS_MD, { status: 200 }));
      });

      await generator.generate();

      const files = await refManager.listReferences();
      expect(files).toContain("plugins/manifest-schema.md");
      expect(files).toContain("plugins/component-types.md");
      expect(files).toContain("plugins/directory-structure.md");
      expect(files).toContain("plugins/installation-scopes.md");
      expect(files).toContain("plugins/cli-commands.md");
    });
  });

  describe("generateFromContent", () => {
    it("should generate from provided content without fetching", async () => {
      const contents = new Map<string, string>();
      contents.set("plugins.md", MOCK_PLUGINS_MD);
      contents.set("plugins-reference.md", MOCK_PLUGINS_REF_MD);

      await generator.generateFromContent(contents);

      const files = await refManager.listReferences();
      expect(files.length).toBeGreaterThan(0);
    });
  });
});
