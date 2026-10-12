# CLAUDE.md

All project rules for coding agents live in AGENTS.md so Claude Code and Codex share one source of truth.

@AGENTS.md

Claude Code specifics:

- Start each session by reading `docs/mvp-spec.md` sections 3 (scope), 4 (every mechanic) and 9 (milestones), then check which milestone is in progress from the git log.
- Look at the reference images in `docs/refs/` before building or changing any UI or scene layout, and read `docs/refs/README.md` first: the refs set the look, the spec decides what exists.
- Use plan mode for anything touching more than three files.
