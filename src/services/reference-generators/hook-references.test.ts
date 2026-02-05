import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { HookReferenceGenerator } from "./hook-references.ts";
import { ReferenceManager } from "../reference-manager.ts";
import { mkdir, rm, readFile, exists } from "node:fs/promises";
import { join } from "node:path";

describe("HookReferenceGenerator", () => {
  const testReferencesDir = "/tmp/phoenixlab-hook-refs-test";
  let generator: HookReferenceGenerator;
  let refManager: ReferenceManager;
  const originalFetch = globalThis.fetch;

  // Sample hooks documentation content
  const MOCK_HOOKS_MD = `# Hooks reference

Hooks are user-defined shell commands or LLM prompts that execute automatically at specific points in Claude Code's lifecycle.

## Hook lifecycle

| Event                | When it fires                                        |
| :------------------- | :--------------------------------------------------- |
| \`SessionStart\`       | When a session begins or resumes                     |
| \`UserPromptSubmit\`   | When you submit a prompt, before Claude processes it |
| \`PreToolUse\`         | Before a tool call executes. Can block it            |
| \`PermissionRequest\`  | When a permission dialog appears                     |
| \`PostToolUse\`        | After a tool call succeeds                           |
| \`PostToolUseFailure\` | After a tool call fails                              |
| \`Notification\`       | When Claude Code sends a notification                |
| \`SubagentStart\`      | When a subagent is spawned                           |
| \`SubagentStop\`       | When a subagent finishes                             |
| \`Stop\`               | When Claude finishes responding                      |
| \`PreCompact\`         | Before context compaction                            |
| \`SessionEnd\`         | When a session terminates                            |

## Configuration

### Matcher patterns

The \`matcher\` field is a regex string that filters when hooks fire.

| Event                                                                  | What the matcher filters  | Example matcher values                                                         |
| :--------------------------------------------------------------------- | :------------------------ | :----------------------------------------------------------------------------- |
| \`PreToolUse\`, \`PostToolUse\`, \`PostToolUseFailure\`, \`PermissionRequest\` | tool name                 | \`Bash\`, \`Edit\\|Write\`, \`mcp__.*\`                                               |
| \`SessionStart\`                                                         | how the session started   | \`startup\`, \`resume\`, \`clear\`, \`compact\`                                        |
| \`SessionEnd\`                                                           | why the session ended     | \`clear\`, \`logout\`, \`prompt_input_exit\`, \`bypass_permissions_disabled\`, \`other\` |

### Hook handler fields

| Field           | Required | Description                                                                                                                                   |
| :-------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| \`type\`          | yes      | \`"command"\`, \`"prompt"\`, or \`"agent"\`                                                                                                         |
| \`timeout\`       | no       | Seconds before canceling. Defaults: 600 for command, 30 for prompt, 60 for agent                                                              |
| \`statusMessage\` | no       | Custom spinner message displayed while the hook runs                                                                                          |

### Exit code output

**Exit 0** means success.
**Exit 2** means a blocking error.
**Any other exit code** is a non-blocking error.

| Hook event           | Can block? | What happens on exit 2                                    |
| :------------------- | :--------- | :-------------------------------------------------------- |
| \`PreToolUse\`         | Yes        | Blocks the tool call                                      |
| \`PermissionRequest\`  | Yes        | Denies the permission                                     |
| \`PostToolUse\`        | No         | Shows stderr to Claude (tool already ran)                 |

## Hook events

### PreToolUse

Runs after Claude creates tool parameters and before processing the tool call.

\`\`\`json
{
  "session_id": "abc123",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test"
  }
}
\`\`\`

### PostToolUse

Runs immediately after a tool completes successfully.
`;

  beforeEach(async () => {
    await rm(testReferencesDir, { recursive: true, force: true });
    await mkdir(testReferencesDir, { recursive: true });
    refManager = new ReferenceManager(testReferencesDir);
    generator = new HookReferenceGenerator(refManager);
  });

  afterEach(async () => {
    await rm(testReferencesDir, { recursive: true, force: true });
    globalThis.fetch = originalFetch;
  });

  describe("fetchHooksDocumentation", () => {
    it("should fetch hooks documentation from the web", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(MOCK_HOOKS_MD, { status: 200 }))
      );

      const content = await generator.fetchHooksDocumentation();

      expect(content).toContain("Hooks reference");
      expect(content).toContain("PreToolUse");
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    it("should throw on fetch error", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response("Not Found", { status: 404 }))
      );

      await expect(generator.fetchHooksDocumentation()).rejects.toThrow();
    });
  });

  describe("generateEventsOverview", () => {
    it("should generate events overview markdown", () => {
      const content = generator.generateEventsOverview(MOCK_HOOKS_MD);

      expect(content).toContain("# Hook Events");
      expect(content).toContain("SessionStart");
      expect(content).toContain("PreToolUse");
      expect(content).toContain("When it fires");
    });

    it("should include the events table", () => {
      const content = generator.generateEventsOverview(MOCK_HOOKS_MD);

      expect(content).toContain("| Event");
      expect(content).toContain("SessionStart");
      expect(content).toContain("When a session begins");
    });
  });

  describe("generateMatcherPatterns", () => {
    it("should generate matcher patterns reference", () => {
      const content = generator.generateMatcherPatterns(MOCK_HOOKS_MD);

      expect(content).toContain("# Matcher Patterns");
      expect(content).toContain("tool name");
      expect(content).toContain("Bash");
    });
  });

  describe("generateHandlerTypes", () => {
    it("should generate handler types reference", () => {
      const content = generator.generateHandlerTypes(MOCK_HOOKS_MD);

      expect(content).toContain("# Handler Types");
      expect(content).toContain("command");
      expect(content).toContain("prompt");
      expect(content).toContain("agent");
    });
  });

  describe("generateExitCodes", () => {
    it("should generate exit codes reference", () => {
      const content = generator.generateExitCodes(MOCK_HOOKS_MD);

      expect(content).toContain("# Exit Codes");
      expect(content).toContain("`0`");
      expect(content).toContain("`2`");
    });

    it("should include the exit code behavior table", () => {
      const content = generator.generateExitCodes(MOCK_HOOKS_MD);

      expect(content).toContain("Can block?");
      expect(content).toContain("PreToolUse");
    });
  });

  describe("generateInputOutputSchemas", () => {
    it("should generate input/output schemas reference", () => {
      const content = generator.generateInputOutputSchemas(MOCK_HOOKS_MD);

      expect(content).toContain("# Input/Output Schemas");
      expect(content).toContain("session_id");
      expect(content).toContain("tool_name");
    });
  });

  describe("generateTroubleshooting", () => {
    it("should generate troubleshooting reference", () => {
      const content = generator.generateTroubleshooting(MOCK_HOOKS_MD);

      expect(content).toContain("# Troubleshooting");
    });
  });

  describe("generate", () => {
    it("should generate all hook reference files", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(MOCK_HOOKS_MD, { status: 200 }))
      );

      await generator.generate();

      // Check that all expected files were created
      const files = await refManager.listReferences();
      expect(files).toContain("hooks/events-overview.md");
      expect(files).toContain("hooks/matcher-patterns.md");
      expect(files).toContain("hooks/handler-types.md");
      expect(files).toContain("hooks/exit-codes.md");
      expect(files).toContain("hooks/input-output-schemas.md");
      expect(files).toContain("hooks/troubleshooting.md");
    });

    it("should generate properly formatted content", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(MOCK_HOOKS_MD, { status: 200 }))
      );

      await generator.generate();

      const eventsContent = await readFile(
        join(testReferencesDir, "hooks/events-overview.md"),
        "utf-8"
      );
      expect(eventsContent).toContain("# Hook Events");

      const matcherContent = await readFile(
        join(testReferencesDir, "hooks/matcher-patterns.md"),
        "utf-8"
      );
      expect(matcherContent).toContain("# Matcher Patterns");
    });

    it("should keep files under 3KB", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(MOCK_HOOKS_MD, { status: 200 }))
      );

      await generator.generate();

      const files = await refManager.listReferences();
      for (const file of files) {
        const content = await readFile(join(testReferencesDir, file), "utf-8");
        expect(content.length).toBeLessThan(3000);
      }
    });
  });

  describe("generateFromContent", () => {
    it("should generate from provided content without fetching", async () => {
      await generator.generateFromContent(MOCK_HOOKS_MD);

      const files = await refManager.listReferences();
      expect(files.length).toBeGreaterThan(0);
      expect(files).toContain("hooks/events-overview.md");
    });
  });
});
