# Agents

- Package manager: bun (`bun install`, `bun run <script>`). Lint with `bun run lint` (oxlint), format with `bun run fmt` (oxfmt), typecheck with `bun run typecheck`.
- UI: before using ui-sdk, follow the ui-sdk skill if it's installed, and read `node_modules/@ui-sdk/react/docs/llms.txt`. To build a new component, also search `node_modules/@ui-sdk/react/docs/core.md` by heading, and read `rendering.md` next to it.
- Styling: Tailwind CSS v4, tokens in `src/app/globals.css`.
- Privacy: every event property goes through `src/lib/anonymize.ts`, on ingestion and on display. Never show or store anything that identifies a person.
- `POST /api/v1/events` is the contract Papyrus Compiler App sends to: keep it backward compatible.
