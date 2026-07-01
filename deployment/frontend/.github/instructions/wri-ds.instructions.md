---
description: 'Use when importing or using @worldresources/wri-design-systems components, tokens, or utilities. Covers component hierarchy, API verification, design tokens, and forbidden patterns.'
applyTo: '**/*.tsx'
---

# WRI Design System — Usage Rules

## Pre-Implementation Checklist (MANDATORY — run before writing any JSX)

1. **Query Storybook MCP first** — call `mcp_wri-storybook_getComponentList` then `mcp_wri-storybook_getComponentsProps` to confirm the component exists and its exact prop API. Never guess props.
2. **WRI DS first** — if it exists in the library, use it. Never use the raw Chakra equivalent when WRI DS already wraps it.
3. **No style overrides** — do not use `sx`, `css`, `style`, or `className` to override WRI DS component styles.
4. **Tokens only** — all values via `getThemed*` from `@worldresources/wri-design-systems`. No hardcoded `#hex`, `rem`, `px`.
5. **No Chakra v2 API** — verify props via Chakra MCP before using any Chakra component.
6. **Accessibility check** — confirm that necessary `aria-*` props, roles, and keyboard navigation considerations are explicitly added.

## Accessibility (A11y) — Mandatory

When consuming WRI DS components, always ensure that accessibility context is preserved and passed correctly.

1. **Name every control:** If a control has no visible text label (icon-only, or label is visually hidden), you **must** provide an accessible name via `aria-label` (or `aria-labelledby`).
2. **Connect helper/error text:** When there is helper text or validation errors, connect it using `aria-describedby` (and `aria-errormessage` if the component supports it). Prefer the component’s built-in props for this (verify via Storybook MCP) instead of custom DOM glue.
3. **State must be announced:** For toggles/menus/expanders, reflect state with `aria-expanded`, `aria-controls`, `aria-pressed`, `aria-selected` as appropriate (again: verify the DS component API first).
4. **Keyboard support is non‑negotiable:** Any custom wrapper around DS components must preserve focusability and keyboard activation (Enter/Space for buttons; Arrow keys where applicable). Do not remove focus outlines.
5. **Tables and lists:** Provide structure (`caption`, correct header cells, sort state announcements like `aria-sort`) when using tabular components. If you can’t confirm the right props, stop and query Storybook MCP.

### A11y Defaults When Using Common DS Components

These rules apply when consuming components; **do not invent prop names**—verify each component’s actual a11y-related props with Storybook MCP.

- **`Button`, `IconButton`, `CloseButton`**
  - Icon-only actions: require `aria-label` (localized).
  - Destructive actions: ensure the visible label is explicit (“Delete”, “Remove”, etc.) and confirm focus/disabled states still announce correctly.
- **`Tooltip`**
  - Tooltip is not a label replacement. Keep `aria-label`/visible label on the trigger when the action is otherwise unlabeled.
- **`Menu` (trigger + items)**
  - Icon-only trigger: require `aria-label`.
  - If the trigger opens/closes, ensure state is represented (often `aria-expanded` is handled by the component—verify).
- **`Modal` / `Sheet`**
  - Provide a clear, unique title and ensure it is announced (typically via `aria-labelledby` or a `title` prop depending on the DS API).
  - Ensure close action is reachable and labeled (`aria-label` on close icon buttons).
- **Form controls (`TextInput`, `Select`, `Textarea`, `Checkbox`, `Radio`, etc.)**
  - Prefer the DS `label` prop (or label slot) for accessible naming.
  - If a field is required/invalid/disabled, ensure the correct state is exposed via props (verify which props exist).
- **`Table`**
  - Sortable headers must communicate sort state (`aria-sort` or DS equivalent). Do not rely on icon color alone.
  - Provide row selection announcements where selection exists.
- **`Toast`, `InlineMessage`, `AlertBanner`**
  - Status messages must be announced appropriately (`role="status"` / `role="alert"` behavior). Prefer DS defaults; if composing custom status UI, add the correct roles and `aria-live` semantics.

## Component Hierarchy (never skip a level)

```
1. @worldresources/wri-design-systems  ← always check first
2. @chakra-ui/react                    ← fallback if no WRI DS equivalent exists
3. Custom code                         ← last resort; add // [CUSTOM COMPONENT] — <reason>
```

```tsx
// ❌ Raw Chakra when WRI DS already wraps it
import { Button } from '@chakra-ui/react'

// ✅ WRI DS component
import { Button } from '@worldresources/wri-design-systems'
;<Button variant='primary'>Save</Button>
```

Custom components that have no WRI DS or Chakra equivalent must be marked:

```tsx
// [CUSTOM COMPONENT] — no WRI DS or Chakra equivalent for X
const MyThing = () => { ... }
```

## API Verification — Never Guess

Confirm props, variants, and valid values from a trusted source before writing code:

1. **Storybook MCP** → `mcp_wri-storybook_getComponentsProps` (preferred for WRI DS)
2. **Component README** → GitHub `src/components/<Category>/<Name>/README.md`
3. **Chakra MCP** → `mcp_chakra-ui_get_component_props` (for Chakra-only components)

If you cannot confirm an API, ask the user rather than inventing props.

## Design Tokens

```ts
import {
  getThemedColor,
  getThemedSpacing,
  getThemedRadius,
  getThemedBorderWidth,
  getThemedFontSize,
  getThemedLineHeight,
} from '@worldresources/wri-design-systems'
```

| Function                        | Tokens                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| `getThemedColor(variant, step)` | variants: `neutral primary secondary success warning error accessible`; steps: `100–900` |
| `getThemedSpacing(token)`       | `0 50 100 200 300 400 500 600 700 800 900 1000 1100 1200 1400 1600 2000 2400 2800`       |
| `getThemedRadius(token)`        | `100 200 300 400 500 600 700 800 900`                                                    |
| `getThemedBorderWidth(token)`   | `100 200 300 400`                                                                        |
| `getThemedFontSize(token)`      | `200 300 400 500 600 700 800 900 1000 1100`                                              |
| `getThemedLineHeight(token)`    | `300 400 500 600 700 800 900 1000 1100 1200`                                             |

```tsx
// ❌ Hardcoded value
<Box p="1rem" bg="#2C7D6E" borderRadius="8px" />

// ✅ Design tokens
<Box
  p={getThemedSpacing(400)}
  bg={getThemedColor('primary', 500)}
  borderRadius={getThemedRadius(300)}
/>
```

## Forbidden Patterns

| Pattern                                                              | Correct alternative                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------- |
| `import { Button } from '@chakra-ui/react'` when WRI DS has `Button` | `import { Button } from '@worldresources/wri-design-systems'` |
| `<Button sx={{ ... }}>` overriding WRI DS styles                     | Remove style override                                         |
| Hardcoded `#hex`, `rem`, `px`                                        | `getThemed*` tokens                                           |
| Raw token strings: `<Box bg="primary.500" />`                        | `getThemedColor('primary', 500)`                              |
| Inventing prop names without checking MCP                            | Query Storybook MCP first                                     |
| Chakra v2 API (`colorScheme`, `variant` on v2 components)            | Verify via Chakra MCP                                         |

## Internationalization (i18n)

All WRI DS components render English by default — no setup required for English-only apps.

To provide translated strings, use one of two opt-in approaches:

**Provider** (recommended when multiple components or screens need translations):

```tsx
import { DesignSystemLocaleProvider, type DesignSystemLabels } from '@worldresources/wri-design-systems'

const labels: DesignSystemLabels = {
  CheckboxList: { expandLabel: t('ds.expand'), hideLabel: t('ds.hide') },
  TextInput: { optionalSuffix: t('common.optional'), requiredSymbolLabel: t('common.required') },
}
<DesignSystemLocaleProvider labels={labels}><App /></DesignSystemLocaleProvider>
```

**Per-component `labels` prop** (for isolated instances):

```tsx
<Password
  labels={{ showLabel: t('password.show'), hideLabel: t('password.hide') }}
/>
```

Pass pre-resolved strings only — never hardcoded English literals in `labels` props. Always route through your app's translation function.

Full reference — all supported components, label types, and patterns: `docs/i18n/README.md`.
