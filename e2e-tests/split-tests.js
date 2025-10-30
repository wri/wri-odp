import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get test files
const testDir = join(__dirname, 'cypress', 'e2e');
const testFiles = readdirSync(testDir)
  .filter(file => file.endsWith('.cy.js'))
  .sort(); // Sort alphabetically for consistent grouping

// Get group configuration from command line arguments
const groupIndex = parseInt(process.argv[2]) || 1; // Which group to run (1-based)
const totalGroups = parseInt(process.argv[3]) || 6; // Total number of groups

// Calculate tests per group
const testsPerGroup = Math.ceil(testFiles.length / totalGroups);
const startIndex = (groupIndex - 1) * testsPerGroup;
const endIndex = Math.min(startIndex + testsPerGroup, testFiles.length);

// Get files for this group
const groupFiles = testFiles.slice(startIndex, endIndex);

// Build the spec pattern
const specPattern = groupFiles.map(file => `cypress/e2e/${file}`).join(',');

console.log(`Running group ${groupIndex} of ${totalGroups}`);
console.log(`Tests in this group (${groupFiles.length}): ${groupFiles.join(', ')}`);
console.log(`\nSpec pattern: ${specPattern}`);

// Output the spec pattern for Cypress to use
process.stdout.write(specPattern);

