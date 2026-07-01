# WRI Design System — AI Context

This file provides context for AI coding agents working on WRI projects.
`@worldresources/wri-design-systems` is the **standard component library for all World Resources Institute products**, built on Chakra UI v3.

> If your editor supports per-file instructions (e.g. VS Code Copilot), detailed usage rules
> live in `.github/instructions/wri-ds.instructions.md` and auto-attach when you edit `.tsx` files.
> Read that file before using any WRI DS component.

## What is the WRI Design System?

`@worldresources/wri-design-systems` is built on Chakra UI v3 and provides WRI-branded components shared across WRI products. **Do not override component styles** — visual consistency depends on using the library as-is.

| Resource    | URL                                                              |
| ----------- | ---------------------------------------------------------------- |
| Storybook   | https://wri.github.io/wri-design-systems/                        |
| npm         | https://www.npmjs.com/package/@worldresources/wri-design-systems |
| Style guide | https://zeroheight.com/4221801da                                 |

## Component Hierarchy — Never Skip a Level

```
1. @worldresources/wri-design-systems  ← always check first (Storybook MCP)
2. @chakra-ui/react                    ← fallback if no WRI DS equivalent
3. Custom code                         ← last resort; add // [CUSTOM COMPONENT] comment
```

## Component Rules — Read Before Implementing Anything

**Before writing any component code, read `.github/instructions/wri-ds.instructions.md`.**
It contains the mandatory pre-implementation checklist, API verification steps, token rules, and forbidden patterns.

Key rules (full details in the instructions file):

1. **Query MCP before coding** — use Storybook MCP to confirm which WRI DS components exist and their props. Never guess.
2. **WRI DS first** — if a WRI DS component exists, use it. Never use the raw Chakra equivalent.
3. **No style overrides** — do not use `sx`, `css`, or inline styles to override WRI DS component styles.
4. **Tokens only** — use `getThemed*` from `@worldresources/wri-design-systems`. No hardcoded `#hex`, `rem`, `px`.
5. **No Chakra v2 API** — v3 has breaking changes. Verify props via Chakra MCP.
6. **Accessibility first** — always provide `aria-*` props (like `aria-label` or `aria-describedby`), explicit `role` attributes, and ensure keyboard focus navigation context when consuming components.

## Internationalization (i18n) — Optional

All WRI DS components ship with English defaults. No i18n setup is needed for English-only apps.

If your application supports multiple languages, override internal component strings by passing pre-translated values via `DesignSystemLocaleProvider` (app-wide) or the component's `labels` prop (per-instance). The library has no runtime i18n dependency — pass strings from your own stack (react-intl, react-i18next, etc.).

```tsx
import { DesignSystemLocaleProvider } from '@worldresources/wri-design-systems'
;<DesignSystemLocaleProvider
  labels={{
    TextInput: {
      optionalSuffix: t('common.optional'),
      requiredSymbolLabel: t('common.required'),
    },
  }}
>
  <App />
</DesignSystemLocaleProvider>
```

Full reference — supported components, label types, and usage patterns: `docs/i18n/README.md`.

## Design Tokens — Source of Truth

All token functions are imported from the **package**:

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
| `getThemedSpacing(token)`       | `0 50 100 200 300 400 500 600 700 800 900 1000…`                                         |
| `getThemedRadius(token)`        | `100 200 300 400 500 600 700 800 900`                                                    |
| `getThemedBorderWidth(token)`   | `100 200 300 400`                                                                        |
| `getThemedFontSize(token)`      | `200 300 400 500 600 700 800 900 1000 1100`                                              |
| `getThemedLineHeight(token)`    | `300 400 500 600 700 800 900 1000 1100 1200`                                             |

Full token tables: `agents/spacing.md`, `agents/radius.md`, `agents/border-width.md`, `agents/typography.md`.

## MCP Servers (configured automatically by `npx ds setup-ai`)

- **Storybook MCP** — WRI DS components, props, and usage patterns
- **Chakra UI MCP** — Chakra v3 component props and migration guidance
