# ContextVM Site Project Guide

## About the Project

Modern web application built with Svelte 5 and Applesauce Nostr library ecosystem

## Tech Stack

### Core

- **Svelte 5**: Reactive UI with runes (signals)
- **SvelteKit**: Full-stack framework
- **TypeScript**: Strict type checking
- **Vite**: Build tool and dev server
- **Bun**: Package manager

### UI & Styling

- **Tailwind CSS v4**: Utility-first CSS
- **Shadcn Svelte**: Component library
- **Bits UI**: Headless UI components
- **Lucide Svelte**: Icons

### Nostr & Data

- **Applesauce**: Core, Loaders, Accounts, Signers, Relay
- **Nostr Tools**: Protocol implementation
- **RxJS**: Reactive programming
- **Marked**: Markdown parsing
- **DOMPurify**: HTML sanitization

## Commands

```sh
bun run dev        # Start dev server
bun run build      # Build for production
bun run preview    # Preview build
bun run check      # TypeScript check
bun run check:watch # Watch & check
bun run format     # Format code
bun run lint       # Lint code
```

## Code Style

### Svelte 5

- Use runes: `$state()`, `$derived()`, `$effect()`
- Component props: `$props()` with typing
- Two-way binding: `$bindable()`
- Prefer reactive over DOM manipulation

### Naming

- **Components**: PascalCase (`ArticleCard.svelte`)
- **Functions/Variables**: camelCase (`formatUnixTimestamp`)
- **Constants**: UPPER_SNAKE_CASE (`CONTEXTVM_PUBKEY`)
- **Files**: kebab-case for routes

### Error Handling

- TypeScript strict mode
- Error boundaries in components
- Try-catch for async operations
- Sanitize user content with DOMPurify

## Svelte 5 + Applesauce

**Reactive Data Loading:**

```typescript
const blogArticles = eventStore.model(TimelineModel, articlesFilter);
```

**RxJS Integration:** Svelte 5 consumes RxJS observables with `$` prefix.

**State Management:**

- `$state()` for local state
- `$derived()` for computed values
- `$effect()` for side effects
- Applesauce event store for global Nostr state

**Nostr Patterns:**

- ReplaceableModel for articles
- Proper event filtering
- Graceful relay handling
- addressLoader for lookups
