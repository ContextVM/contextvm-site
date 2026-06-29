# ContextVM

Modern web application for discovering, connecting to, and orchestrating MCP (Model Context Protocol) servers over Nostr.

## Tech Stack

- **Svelte 5** + **SvelteKit** — reactive UI with runes
- **TypeScript** — strict type checking
- **Tailwind CSS v4** + **Shadcn Svelte** — styling & components
- **Applesauce** — Nostr event store, loaders, accounts
- **Bun** — package manager & runtime

## Getting Started

```sh
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build
```

## Project Structure

```
src/
├── lib/
│   ├── components/     # UI components (chat, landing, ui)
│   ├── services/       # LLM, MCP client, agent orchestrator, payments
│   ├── models/         # Nostr event models (server announcements)
│   ├── queries/        # TanStack Query hooks
│   ├── stores/         # Svelte 5 reactive stores
│   └── types/          # TypeScript type definitions
├── routes/             # SvelteKit routes (chat, servers, blog, etc.)
└── app.css             # Global styles
```

## Commands

| Command           | Description               |
| ----------------- | ------------------------- |
| `bun run dev`     | Start development server  |
| `bun run build`   | Build for production      |
| `bun run preview` | Preview production build  |
| `bun run check`   | TypeScript type check     |
| `bun run format`  | Format code with Prettier |
| `bun run lint`    | Lint code with ESLint     |

## Key Features

- **Server Catalog** — browse MCP servers announced over Nostr
- **One-Click Connect** — connect to servers directly from the chat
- **Agent Orchestration** — LLM-powered tool orchestration across connected servers
- **Nostr Identity** — server lookup via NIP-05, npub, hex pubkey
- **Payments** — CEP-8 payment flow for paid server tools
