import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { MCPReferenceGenerator } from "./mcp-references.ts";
import { ReferenceManager } from "../reference-manager.ts";
import { mkdir, rm } from "node:fs/promises";

describe("MCPReferenceGenerator", () => {
  const testReferencesDir = "/tmp/phoenixlab-mcp-refs-test";
  let generator: MCPReferenceGenerator;
  let refManager: ReferenceManager;
  const originalFetch = globalThis.fetch;

  const MOCK_MCP_MD = `# Connect Claude Code to tools via MCP

Learn how to connect Claude Code to your tools with the Model Context Protocol.

## What is MCP?

MCP (Model Context Protocol) lets Claude Code connect to external services and tools.

## Configuration

MCP servers are configured in \`.mcp.json\`:

\`\`\`json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"]
    }
  }
}
\`\`\`

## Tool naming

MCP tools follow the pattern \`mcp__<server>__<tool>\`:

- \`mcp__memory__create_entities\`
- \`mcp__filesystem__read_file\`
- \`mcp__github__search_repositories\`

## Built-in servers

Available MCP servers:

| Server | Description |
| --- | --- |
| memory | Entity-based memory storage |
| filesystem | File system access |
| github | GitHub API integration |
| slack | Slack workspace integration |
`;

  beforeEach(async () => {
    await rm(testReferencesDir, { recursive: true, force: true });
    await mkdir(testReferencesDir, { recursive: true });
    refManager = new ReferenceManager(testReferencesDir);
    generator = new MCPReferenceGenerator(refManager);
  });

  afterEach(async () => {
    await rm(testReferencesDir, { recursive: true, force: true });
    globalThis.fetch = originalFetch;
  });

  describe("generateOverview", () => {
    it("should generate MCP overview", () => {
      const content = generator.generateOverview(MOCK_MCP_MD);

      expect(content).toContain("# MCP Overview");
      expect(content).toContain("Model Context Protocol");
    });
  });

  describe("generateServerConfiguration", () => {
    it("should generate server configuration reference", () => {
      const content = generator.generateServerConfiguration(MOCK_MCP_MD);

      expect(content).toContain("# Server Configuration");
      expect(content).toContain(".mcp.json");
      expect(content).toContain("mcpServers");
    });
  });

  describe("generateToolNaming", () => {
    it("should generate tool naming reference", () => {
      const content = generator.generateToolNaming(MOCK_MCP_MD);

      expect(content).toContain("# Tool Naming");
      expect(content).toContain("mcp__");
    });
  });

  describe("generate", () => {
    it("should generate all MCP reference files", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(MOCK_MCP_MD, { status: 200 }))
      );

      await generator.generate();

      const files = await refManager.listReferences();
      expect(files).toContain("mcp/overview.md");
      expect(files).toContain("mcp/server-configuration.md");
      expect(files).toContain("mcp/tool-naming.md");
    });
  });
});
