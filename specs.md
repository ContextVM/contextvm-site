# Servers Page Redesign Specs (`/servers`)

Reference design: Figma file `SlIJqN61r5pGbbLy1w7VC5`, page `final`, frame `Redesigned` ([link](https://www.figma.com/design/SlIJqN61r5pGbbLy1w7VC5/Context-Webpage-by-Varun?node-id=37-687&t=p1oHQuBtrWIUqKC9-1)).

## Goal

Implement the redesigned UI/UX for the servers listing experience while preserving existing content and search behavior, and fix the loading flow so cards do not stay in skeleton state indefinitely.

## Scope

In scope:
- `src/routes/servers/+page.svelte`
- `src/lib/components/ServerCard.svelte`
- `src/lib/components/LoadingCard.svelte`
- `src/lib/queries/serverQueries.ts` (loading-state reliability)
- `src/lib/stores/relay-store.svelte.ts` (default relay behavior relevant to loading)

Shared usage impact:
- Any page using `ServerCard` should remain visually coherent after the new compact card layout.

Out of scope:
- Changing server content fields or text copy.
- Introducing real server health checks.
- Reworking search/filter logic semantics.

## Content Invariants (Must Stay Constant)

Keep existing source text/information unchanged:
- Page title, subtitle, SEO title/description.
- Search semantics and identifier resolution behavior.
- Empty/no-result messages and CTA text.
- Server data fields used in cards (`name`, `about`, `created_at`, link destination).

Only layout/styling/spacing/state presentation may change.

## Required UI Changes

### 1) Search Section
- Keep existing search logic and binding to `searchTerm`.
- Update visual styling to redesigned treatment:
  - full-width input in the content container
  - leading search icon
  - compact spacing between search and result count label
- Placeholder remains functionally the same.

### 2) Count Label
- Place a small left-aligned label directly under search.
- Format: `X Servers available`.
- Use subdued text style (`text-sm text-muted-foreground`).

### 3) Card Grid + Density
- Responsive layout requirements:
  - Mobile (`<640px`): `1` column
  - Tablet (`>=640px and <1024px`): `2` columns
  - Desktop (`>=1024px`): `3` columns
- Use compact spacing (`gap-3` / equivalent) to match redesigned density.

### 4) Pagination
- Show first `6` cards by default.
- Add centered button: `Load more servers`.
- Each click increases visible cards by `6`.
- Hide button when all matched cards are shown.
- Applies to normal list and filtered results list.

### 5) Server Card Layout
- Use redesigned compact layout (no large thumbnail block).
- Keep content fields the same:
  - server name
  - short description/about
  - active since date from `created_at`
  - visit-server link/CTA
- Status indicator:
  - static green dot and `LIVE` label by default
  - no runtime connectivity check yet (future enhancement)
- Keep hover affordance (`Visit server` arrow animation and subtle shadow).

### 6) Loading Skeleton
- Add/keep a `server-row` skeleton variant that mirrors card structure.
- Use it in all loading states on `/servers`.
- Show `6` skeleton cards for loading placeholders.

### 7) Empty + Resolve States
- Preserve existing behavior and text for:
  - no servers found
  - identifier resolution in progress
  - resolved single server card + go-link flow
- Ensure these states also follow responsive spacing/layout.

## Loading Reliability Requirements (Critical Fix)

The page must not remain indefinitely in skeleton mode when relays are unreachable or no events arrive.

Required behavior:
- Announcements query should avoid infinite pending state for timeline streams.
- UI loading branch should transition deterministically to one of:
  - real cards
  - empty/no-data message
  - error-safe fallback

Implementation requirements:
- Use a bounded initial wait for announcements (e.g. timeout) in query flow.
- Ensure loading condition depends on actual initial-load semantics + data presence.
- Avoid indefinite UI-only loading loops.

## Relay Defaults

Default selected relays should be production/public relays in development and production unless the user explicitly switches to local dev relay mode.

Rationale:
- Prevent accidental default to `localhost` relay causing no data and persistent loading.

## Validation Checklist

1. Visual parity
- Search width/icon/spacing matches redesigned intent.
- Card grid density and spacing align with redesigned frame.
- Compact card hierarchy reads clearly at all breakpoints.

2. Responsiveness
- Mobile: 1-column compact cards, full-width controls.
- Tablet: 2-column grid.
- Desktop: 3-column grid.
- No overlap/truncation regressions in card footer/meta row.

3. Behavior
- Pagination starts at 6 and increments by 6.
- Search logic remains unchanged (only visuals changed).
- Loading skeleton transitions to real/empty states; no stuck infinite skeleton.

4. Quality checks
- `bun run check` passes.
- Lints for touched files are clean.
