---
name: react-nextjs
description: React and Next.js patterns - component design, state management, data fetching, App Router, Server Components. Use when building web applications.
---

# React & Next.js Patterns

## When to Activate
- Building React components or pages
- Setting up Next.js project structure
- Choosing state management approach
- Optimizing data fetching
- Migrating to App Router

## Component Design

### Principles
- Small, focused components (one responsibility)
- Composition over inheritance
- Function components with hooks
- Props defined with TypeScript interfaces

```tsx
interface UserCardProps {
  user: User;
  onSelect: (id: string) => void;
}

function UserCard({ user, onSelect }: UserCardProps) {
  return <button onClick={() => onSelect(user.id)}>{user.name}</button>;
}
```

### Compound Components
Use when related UI shares state and interaction:

```tsx
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">...</Tabs.Content>
  <Tabs.Content value="settings">...</Tabs.Content>
</Tabs>
```

### Container / Presentational Split
- Container: owns data loading and side effects
- Presentational: receives props, renders UI (pure)

## State Management Decision Tree

| Concern | Tool | When |
|---------|------|------|
| Server state | TanStack Query, SWR | API data, caching |
| Client state | Zustand, Jotai | UI state, preferences |
| URL state | Search params | Filters, pagination, sort |
| Form state | React Hook Form | Complex forms |

### Rules
- Never duplicate server state into client stores
- Derive values instead of storing computed state
- Use URL as state for shareable data

## Data Fetching Patterns

### Stale-While-Revalidate
Return cached data immediately, revalidate in background.

### Optimistic Updates
1. Snapshot current state
2. Apply optimistic update immediately
3. Roll back on failure
4. Show error feedback

### Parallel Loading
- Fetch independent data concurrently
- Avoid parent-child request waterfalls
- Prefetch likely next routes

## Next.js App Router

### Server vs Client Components

| Feature | Server Component | Client Component |
|---------|-----------------|-----------------|
| Default | Yes | No (`"use client"`) |
| Hooks | No | Yes |
| Browser APIs | No | Yes |
| Direct DB access | Yes | No |
| Streaming | Yes | No |

### Decision: When to use `"use client"`
- Interactivity (onClick, onChange)
- Hooks (useState, useEffect)
- Browser APIs (localStorage, window)
- Third-party client libraries

### Patterns
- Server Actions for mutations
- `loading.tsx` and `error.tsx` for boundaries
- Dynamic imports for heavy client components
- Parallel routes for complex layouts
- Intercepting routes for modals

## Custom Hooks

### Rules
- `use` prefix, single responsibility
- Always include cleanup in useEffect
- Never call hooks conditionally
- Avoid useEffect for derived state (use useMemo)

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```

## Anti-Patterns

| Don't | Do Instead |
|-------|-----------|
| Prop drilling through 4+ levels | Context or state library |
| useEffect for derived state | useMemo |
| Giant components (200+ lines) | Split into smaller components |
| Fetch in useEffect | TanStack Query or Server Components |
| Index as key in dynamic lists | Stable unique ID |
| Inline object/function in JSX | useMemo/useCallback or extract |
