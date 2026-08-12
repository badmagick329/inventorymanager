# Inventory Manager interface style

Build a calm school-inventory workspace: trustworthy, efficient, financially
legible, and easy to scan. It should feel like a well-kept operational ledger,
not a generic SaaS dashboard, consumer finance app, or decorative analytics
product.

## Visual language

- Use neutral slate surfaces with restrained blue for primary actions and
  navigation. Support both light and dark themes with equivalent hierarchy.
- Reserve green, amber, and red for meaningful financial or operational states.
  Never use status colours as decoration.
- Use strong but compact headings, quiet supporting copy, and tabular numerals
  for quantities and money.
- Prefer crisp borders, modest rounding, and subtle surface contrast. Avoid
  gradients, glass effects, oversized pills, heavy shadows, and empty hero space.
- Display Pakistani currency with `Rs` or `PKR`. Never use the Indian rupee
  symbol.

## Information hierarchy

- Lead with the information needed to make a decision: outstanding debt,
  revenue, spending, profit, margin, and stock state.
- Pair every metric with an unambiguous label. Do not rely on colour alone.
- Show summaries before detailed tables, but keep tables as the primary place
  for inspecting and editing records.
- Emphasise totals and exceptions. Secondary metadata should remain available
  without competing with the primary figures.
- Do not invent analytics. Derive every displayed value from existing,
  authorised data and preserve location boundaries.

## Layout and components

- Use Tailwind utilities and reusable HeroUI or project primitives. Keep global
  CSS limited to design tokens, base rules, and genuinely shared behavior.
- Use a consistent centred page shell with readable maximum widths. Data tables
  may use the full available width.
- Prefer compact summary bands and structured rows over collections of generic
  dashboard cards.
- Keep page titles, descriptions, counts, and primary actions in a consistent
  header pattern.
- On mobile, stack financial summaries and keep primary actions reachable
  without horizontal scrolling.
- Give empty, loading, failed, disabled, focus, and destructive states deliberate
  treatment in both themes.

## QA

Before calling UI work complete, verify light and dark themes, keyboard focus,
mobile and desktop layouts, readable contrast, Pakistani currency notation,
location-level data isolation, and that floating controls do not obscure page
content.
