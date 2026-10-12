# Bendang Life

A cozy browser game about growing one season of padi on a Kedah bendang. Free on itch.io.

- Spec: `docs/mvp-spec.md`
- Visual target: `docs/refs/`
- Rules for coding agents: `AGENTS.md` (Claude Code reads it through `CLAUDE.md`)
- Game numbers and content: `content/`

## Starting with a coding agent

Put this folder in a new git repo, open it in Claude Code or Codex, and send:

> Read AGENTS.md and docs/mvp-spec.md, look at every image in docs/refs/ and read docs/refs/README.md (the spec wins where they differ). Then do milestone M0 only: scaffold the project with the stack and npm scripts in AGENTS.md, render an empty three.js scene, and make typecheck, lint, test and build all pass. Stop and summarise when M0's "Done when" is met.

After each milestone, review, then ask for the next one by number (M1, M2 …).

## Status

Pre-M0. Spec v2.0. Content files in `content/` are seeded; i18n files and code come with M0–M2.
