import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { SkillReferenceGenerator } from "./skill-references.ts";
import { ReferenceManager } from "../reference-manager.ts";
import { mkdir, rm } from "node:fs/promises";

describe("SkillReferenceGenerator", () => {
  const testReferencesDir = "/tmp/phoenixlab-skill-refs-test";
  let generator: SkillReferenceGenerator;
  let refManager: ReferenceManager;
  const originalFetch = globalThis.fetch;

  const MOCK_SKILLS_MD = `# Extend Claude with skills

Create, manage, and share skills to extend Claude's capabilities.

## Skill structure

Skills are Markdown files with YAML frontmatter:

\`\`\`yaml
---
name: my-skill
description: What this skill does
user-invocable: true
---

Instructions for Claude...
\`\`\`

## Frontmatter fields

| Field | Required | Description |
| --- | --- | --- |
| \`name\` | yes | Unique skill identifier |
| \`description\` | yes | What the skill does |
| \`user-invocable\` | no | Can users invoke with /skillname |
| \`disable-model-invocation\` | no | Prevent automatic invocation |
| \`arguments\` | no | Arguments the skill accepts |
| \`context\` | no | Context handling mode |
| \`agent\` | no | Subagent configuration |

## Skill locations

Skills can be defined at different levels:

| Location | Scope |
| --- | --- |
| \`~/.claude/skills/\` | All projects |
| \`.claude/skills/\` | Current project |
| Plugin \`skills/\` | When plugin enabled |

## Arguments and substitution

Skills can accept arguments with \`$ARGUMENTS\`:

\`\`\`yaml
---
name: greet
arguments: "[name]"
---

Say hello to $ARGUMENTS
\`\`\`

## Subagent execution

Skills can run as subagents with \`context: fork\`:

\`\`\`yaml
---
name: analyze
context: fork
agent:
  model: haiku
  maxTurns: 10
---
\`\`\`
`;

  beforeEach(async () => {
    await rm(testReferencesDir, { recursive: true, force: true });
    await mkdir(testReferencesDir, { recursive: true });
    refManager = new ReferenceManager(testReferencesDir);
    generator = new SkillReferenceGenerator(refManager);
  });

  afterEach(async () => {
    await rm(testReferencesDir, { recursive: true, force: true });
    globalThis.fetch = originalFetch;
  });

  describe("generateFrontmatterReference", () => {
    it("should generate frontmatter reference", () => {
      const content = generator.generateFrontmatterReference(MOCK_SKILLS_MD);

      expect(content).toContain("# Frontmatter Reference");
      expect(content).toContain("name");
      expect(content).toContain("description");
    });
  });

  describe("generateLocationsPriority", () => {
    it("should generate locations reference", () => {
      const content = generator.generateLocationsPriority(MOCK_SKILLS_MD);

      expect(content).toContain("# Skill Locations");
      expect(content).toContain("~/.claude/skills/");
      expect(content).toContain(".claude/skills/");
    });
  });

  describe("generateInvocationControl", () => {
    it("should generate invocation control reference", () => {
      const content = generator.generateInvocationControl(MOCK_SKILLS_MD);

      expect(content).toContain("# Invocation Control");
      expect(content).toContain("user-invocable");
      expect(content).toContain("disable-model-invocation");
    });
  });

  describe("generateArgumentsSubstitution", () => {
    it("should generate arguments substitution reference", () => {
      const content = generator.generateArgumentsSubstitution(MOCK_SKILLS_MD);

      expect(content).toContain("# Arguments & Substitution");
      expect(content).toContain("$ARGUMENTS");
    });
  });

  describe("generateSubagentExecution", () => {
    it("should generate subagent execution reference", () => {
      const content = generator.generateSubagentExecution(MOCK_SKILLS_MD);

      expect(content).toContain("# Subagent Execution");
      expect(content).toContain("context: fork");
      expect(content).toContain("agent");
    });
  });

  describe("generate", () => {
    it("should generate all skill reference files", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(MOCK_SKILLS_MD, { status: 200 }))
      );

      await generator.generate();

      const files = await refManager.listReferences();
      expect(files).toContain("skills/frontmatter-reference.md");
      expect(files).toContain("skills/locations-priority.md");
      expect(files).toContain("skills/invocation-control.md");
      expect(files).toContain("skills/arguments-substitution.md");
      expect(files).toContain("skills/subagent-execution.md");
    });
  });
});
