/**
 * Migration script: @headlessui/react v1 → v2
 *
 * Changes:
 * 1. Replaces compound component JSX (e.g. <Tab.Group> → <TabGroup>)
 * 2. Updates import statements to include new named sub-components
 * 3. Replaces Transition.Root/Child with Transition/TransitionChild
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

// Map of old compound component names to new named exports
const COMPOUND_MAP = {
  'Tab.Group': 'TabGroup',
  'Tab.List': 'TabList',
  'Tab.Panels': 'TabPanels',
  'Tab.Panel': 'TabPanel',
  'Dialog.Panel': 'DialogPanel',
  'Dialog.Title': 'DialogTitle',
  'Dialog.Description': 'DialogDescription',
  'Dialog.Overlay': 'DialogBackdrop',
  'Disclosure.Button': 'DisclosureButton',
  'Disclosure.Panel': 'DisclosurePanel',
  'Listbox.Button': 'ListboxButton',
  'Listbox.Options': 'ListboxOptions',
  'Listbox.Option': 'ListboxOption',
  'Listbox.Label': 'ListboxLabel',
  'Menu.Button': 'MenuButton',
  'Menu.Items': 'MenuItems',
  'Menu.Item': 'MenuItem',
  'Popover.Button': 'PopoverButton',
  'Popover.Panel': 'PopoverPanel',
  'Popover.Group': 'PopoverGroup',
  'Popover.Overlay': 'PopoverOverlay',
  'Combobox.Input': 'ComboboxInput',
  'Combobox.Button': 'ComboboxButton',
  'Combobox.Options': 'ComboboxOptions',
  'Combobox.Option': 'ComboboxOption',
  'Combobox.Label': 'ComboboxLabel',
  'Transition.Root': 'Transition',
  'Transition.Child': 'TransitionChild',
}

// Root components that can appear in imports
const ROOT_COMPONENTS = ['Tab', 'Dialog', 'Transition', 'Disclosure', 'Listbox', 'Menu', 'Popover', 'Combobox', 'Switch']

function getAllTsxFiles(dir) {
  const results = []
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue
      results.push(...getAllTsxFiles(fullPath))
    } else if (['.tsx', '.ts', '.jsx', '.js'].includes(extname(entry.name))) {
      results.push(fullPath)
    }
  }
  return results
}

function migrateFile(filePath) {
  let content = readFileSync(filePath, 'utf8')
  
  // Skip files that don't use headlessui
  if (!content.includes("@headlessui/react")) return false

  const originalContent = content

  // Step 1: Replace compound component JSX tags
  // Handles: <Tab.Group, </Tab.Group>, <Tab.Group />, <Tab.Group {...props}>
  for (const [oldName, newName] of Object.entries(COMPOUND_MAP)) {
    // Escape dots for regex
    const escaped = oldName.replace('.', '\\.')
    // Opening and self-closing tags: <Tab.Group or </Tab.Group
    content = content.replace(new RegExp(`<(/)?(${escaped})([\\s>/{])`, 'g'), `<$1${newName}$3`)
    // Standalone closing tags like </Tab.Group>
    content = content.replace(new RegExp(`</(${escaped})>`, 'g'), `</${newName}>`)
  }

  // Step 2: Merge ALL headlessui import statements into one
  // Collect all identifiers from all headlessui imports, then emit a single import
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@headlessui\/react['"];?\n?/g
  
  const allImportedNames = new Set()
  let firstImportIndex = -1

  // Collect all imports
  let m
  while ((m = importRegex.exec(content)) !== null) {
    if (firstImportIndex === -1) firstImportIndex = m.index
    m[1].split(',').map(s => s.trim()).filter(Boolean).forEach(n => allImportedNames.add(n))
  }

  if (firstImportIndex === -1) return false // no headlessui imports found

  // Remove ALL headlessui imports from content
  content = content.replace(/import\s+\{[^}]+\}\s+from\s+['"]@headlessui\/react['"];?\n?/g, '')

  // Add new named exports based on what transformed JSX uses
  for (const [, newName] of Object.entries(COMPOUND_MAP)) {
    if (content.includes(`<${newName}`) || content.includes(`</${newName}>`)) {
      allImportedNames.add(newName)
    }
  }
  if (content.includes('<TransitionChild') || content.includes('</TransitionChild>')) {
    allImportedNames.add('TransitionChild')
  }

  // Re-insert the single merged import at the position of the first import
  // Find a good insertion point: after the last preceding import line
  const sortedImports = [...allImportedNames].sort()
  const mergedImport = `import { ${sortedImports.join(', ')} } from '@headlessui/react'\n`

  // Insert at first occurrence position (find the line start after removal)
  // Since we removed all imports, just prepend at the top of imports block
  // Find the first 'import ' statement in the file
  const firstImportMatch = content.match(/^import /m)
  if (firstImportMatch && firstImportMatch.index !== undefined) {
    content = content.slice(0, firstImportMatch.index) + mergedImport + content.slice(firstImportMatch.index)
  } else {
    content = mergedImport + content
  }

  if (content !== originalContent) {
    writeFileSync(filePath, content, 'utf8')
    return true
  }
  return false
}

// Run migration
const srcDir = new URL('../src', import.meta.url).pathname
const files = getAllTsxFiles(srcDir)

let migrated = 0
let failed = 0

for (const file of files) {
  try {
    const changed = migrateFile(file)
    if (changed) {
      console.log(`✓ Migrated: ${file.replace(srcDir, 'src')}`)
      migrated++
    }
  } catch (err) {
    console.error(`✗ Error in ${file}: ${err.message}`)
    failed++
  }
}

console.log(`\nDone: ${migrated} files migrated, ${failed} errors`)
console.log('\nNote: Review files using Transition.Root/Child patterns manually.')
console.log('In v2, Dialog/Popover/Menu have built-in transitions — you may simplify those.')
