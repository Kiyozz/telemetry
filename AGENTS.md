# Agents

- Package manager: bun (`bun install`, `bun run <script>`). Lint with `bun run lint` (oxlint), format with `bun run fmt` (oxfmt), typecheck with `bun run typecheck`.
- UI: before using ui-sdk, follow the ui-sdk skill if it's installed, and read `node_modules/@ui-sdk/react/docs/llms.txt`. To build a new component, also search `node_modules/@ui-sdk/react/docs/core.md` by heading, and read `rendering.md` next to it.
- Styling: Tailwind CSS v4, tokens in `src/app/globals.css`.
- Privacy: every event property goes through `src/lib/anonymize.ts`, on ingestion and on display. Never show or store anything that identifies a person.
- `POST /api/v1/events` is the contract Papyrus Compiler App sends to: keep it backward compatible.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
