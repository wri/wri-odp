---
name: ds-ui-creator
description: Guidelines for building user interfaces and components in applications consuming the WRI Design System, incorporating Level 1 (WRI DS), Level 2 (Chakra UI v3), and Level 3 (Custom CSS/HTML).
---

When building components and user interfaces in an application consuming the WRI Design System, developers and AI coding agents must follow these guidelines:

## 1. Component Hierarchy (Golden Rule)

Always evaluate and build UI elements using the following hierarchy. Never skip a level:

```
1. @worldresources/wri-design-systems (WRI DS) ← Always check first
2. @chakra-ui/react (Chakra UI v3)             ← Fallback if no WRI DS equivalent
3. Custom HTML + CSS / Styled Primitives       ← Last resort (requires reasoning tag)
```

### Level 1: WRI Design System (`@worldresources/wri-design-systems`)

- **First Choice**: Check Storybook, Zeroheight style guide, or README files to verify if a component exists in the design system.
- **Do Not Rebuild**: Never use raw elements (e.g. `<button>`, `<input>`, `<select>`) or raw Chakra equivalents when a WRI DS wrapper exists (e.g. `Button`, `IconButton`, `Select`, `TextInput`).
- **No Style Overrides**: Do NOT use `sx`, `css`, `style`, or `className` to override design system component styles. Use them exactly as-is to preserve visual consistency.
- **Query MCP**: Use the Storybook MCP server to check component listings (`mcp_wri-storybook_getComponentList`) and verify exact prop signatures (`mcp_wri-storybook_getComponentsProps`).

### Level 2: Chakra UI v3 (`@chakra-ui/react`)

- **Use as Fallback**: If there is no corresponding WRI DS component, use standard Chakra UI v3 primitives (e.g., `<Box>`, `<Flex>`, `<Grid>`).
- **Chakra v3 API Only**: Do not use legacy Chakra v2 properties (like `colorScheme`, `isDisabled`, or `leftIcon`). Verify all props using the Chakra MCP server (`mcp_chakra-ui_get_component_props`).
- **Theme Integration**: Apply styling using the themed token functions rather than passing raw non-token values.

### Level 3: Custom Code (Last Resort)

- **Required Marker**: If custom CSS or custom HTML is absolutely necessary because neither WRI DS nor Chakra v3 has the capabilities needed, comment it clearly with:
  `// [CUSTOM COMPONENT] — <detailed reason explaining why Level 1 & 2 were bypassed>`
- **No Hardcoding**: Custom components must still use design token functions for sizes, colors, margins, and borders. Never write raw hex colors, px, or rem.

---

## 2. Design Tokens & Theme API (Strict Token Enforcement)

All values (colors, spacing, typography, borders, radii) must resolve through the design system token functions. Never hardcode literal values like `#2C7D6E`, `1rem`, `16px`, etc.

### Token Helper Imports

Import the themed helpers directly from the `@worldresources/wri-design-systems` package:

```typescript
import {
  getThemedColor,
  getThemedSpacing,
  getThemedRadius,
  getThemedBorderWidth,
  getThemedFontSize,
  getThemedLineHeight,
} from '@worldresources/wri-design-systems'
```

### Reference Tables

| Category         | Function                        | Valid Values / Steps / Tokens                                                                                                                                            | Example                                 |
| :--------------- | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------- |
| **Colors**       | `getThemedColor(variant, step)` | **Variants**: `neutral`, `primary`, `secondary`, `success`, `warning`, `error`, `accessible`<br>**Steps**: `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900` | `getThemedColor('primary', 500)`        |
| **Spacing**      | `getThemedSpacing(token)`       | `0`, `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`, `1000`, `1100`, `1200`, `1400`, `1600`, `2000`, `2400`, `2800`                                 | `getThemedSpacing(400)` (1rem)          |
| **Radius**       | `getThemedRadius(token)`        | `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`                                                                                                            | `getThemedRadius(500)` (0.5rem)         |
| **Border Width** | `getThemedBorderWidth(token)`   | `100`, `200`, `300`, `400`                                                                                                                                               | `getThemedBorderWidth(100)` (0.0625rem) |
| **Font Size**    | `getThemedFontSize(token)`      | `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`, `1000`, `1100`                                                                                                   | `getThemedFontSize(700)` (1.5rem)       |
| **Line Height**  | `getThemedLineHeight(token)`    | `300`, `400`, `500`, `600`, `700`, `800`, `900`, `1000`, `1100`, `1200`                                                                                                  | `getThemedLineHeight(400)` (1rem)       |

### Code Examples

```tsx
// ❌ INCORRECT (Hardcoded visual values & bypassed tokens)
<Box
  p="1rem"
  bg="#2C7D6E"
  borderRadius="8px"
  fontSize="16px"
  border="1px solid #E2E8F0"
/>

// ✅ CORRECT (Tokens mapped using design system theme helper functions)
<Box
  p={getThemedSpacing(400)}
  bg={getThemedColor('primary', 500)}
  borderRadius={getThemedRadius(500)}
  fontSize={getThemedFontSize(400)}
  border={`${getThemedBorderWidth(100)} solid ${getThemedColor('neutral', 200)}`}
/>
```

---

## 3. Accessibility (A11y) Requirements

Accessibility must be verified at every call site. Components provide internally sound accessible states, but they require proper configurations from developers:

1. **Accessible Control Names**:
   - Icon-only actions (like `IconButton`, `CloseButton`, or a text-free `Button`) must receive a localized, descriptive `aria-label`.
   - Form fields must have labels. Prefer the built-in `label` prop. If no visible label is shown, provide `aria-label` or `aria-labelledby`.
2. **Interactive States**:
   - Toggle buttons must reflect state with `aria-pressed={isPressed}`.
   - Elements that trigger collapsible panels or menus must use `aria-expanded={isOpen}` and `aria-controls="panel-id"`.
3. **Form Validation & Error States**:
   - When a field has validation errors, set `aria-invalid={true}` and use `aria-describedby` pointing to the error message container. Never signal an error state through color changes alone.
4. **Layout Navigation Landmarks**:
   - Multiple navigation regions must be distinguished with distinct labels (e.g. `<nav aria-label="Main navigation">` and `<nav aria-label="Footer">`).
5. **Tabular Information**:
   - Tables must have an `aria-label` or a `<caption>` child, and sortable headers must announce sorting state via `aria-sort` or its equivalent.
6. **Focus Management**:
   - Never suppress focus outlines (e.g., do not add `outline: none` or set `tabIndex={-1}` on interactive controls unless deliberately building focus-trap cycles).

---

## 4. Internationalization (i18n)

All WRI DS components ship with English defaults. To localize UI strings for other languages, follow one of these patterns:

- **Global/Provider Context**: Wrap the application with `DesignSystemLocaleProvider` to pass common translations (e.g., optional field suffixes, required markers, list expand/hide actions).

  ```tsx
  import { DesignSystemLocaleProvider, type DesignSystemLabels } from '@worldresources/wri-design-systems'

  const labels: DesignSystemLabels = {
    TextInput: {
      optionalSuffix: t('common.optional'),
      requiredSymbolLabel: t('common.required'),
    },
    CheckboxList: {
      expandLabel: t('ds.expand'),
      hideLabel: t('ds.hide'),
    },
  }

  <DesignSystemLocaleProvider labels={labels}>
    <App />
  </DesignSystemLocaleProvider>
  ```

- **Component-Level Override**: Pass translated values directly to the component using its `labels` prop. Never hardcode English literals in the `labels` prop; always route strings through the translation framework.
  ```tsx
  <Password
    labels={{
      showLabel: t('password.show'),
      hideLabel: t('password.hide'),
    }}
  />
  ```

---

## 5. Forbidden Patterns

- **Importing Raw Chakra Primitives when WRI DS Wrappers Exist**: Do not do `import { Button } from '@chakra-ui/react'` when WRI DS has `Button`.
- **Applying Style Overrides on WRI DS Components**: Bypassing design consistency with `sx={{...}}`, `style={{...}}`, or inline style blocks is forbidden.
- **Passing Raw Strings for Tokens**: Do not use `<Box bg="primary.500" />`. Use the exact helper call instead: `<Box bg={getThemedColor('primary', 500)} />`.
- **Placeholder Labels**: Do not use `placeholder` in place of a proper visible label or `aria-label` attribute.
