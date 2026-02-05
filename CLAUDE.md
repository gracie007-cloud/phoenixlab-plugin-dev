# Claude Code Plugin Development

This is a Claude Code plugin. Follow these rules when developing.

## Architecture

**Services + CLI Wrappers** - Strict separation:
- `src/services/` - Business logic, fully tested, no CLI concerns
- `scripts/` - Thin wrappers: argument parsing, output formatting only

## Code Rules

- **TDD**: Write tests first, co-located (`foo.ts` → `foo.test.ts`)
- **Bun**: Use `bun test`, import with `.ts` extension
- **Constructor injection**: Pass dependencies via constructor for testability
- **Path resolution**: Use `process.env.CLAUDE_PLUGIN_ROOT || dirname(dirname(import.meta.path))`
- **Errors**: Throw in services, format user-friendly messages in CLI wrappers
- **Graceful degradation**: Return empty for 404, throw for 500/network errors

## File Structure

```
.claude-plugin/plugin.json    # Plugin manifest
src/services/*.ts             # Business logic + tests
scripts/*.ts                  # CLI wrappers (thin)
skills/<name>/SKILL.md        # Skill definitions
skills/<name>/cache/          # Gitignored runtime cache
skills/<name>/references/     # Generated markdown
commands/<name>.md            # Command definitions
```

## Testing

```bash
bun test                      # Run all tests
```

Mock at boundaries (`globalThis.fetch`), not internal methods.

## See Also

Full documentation: `RULES.md`
