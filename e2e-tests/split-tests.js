// Explicit static test groups.
//
// Historically this script split the alphabetically-sorted spec list into
// evenly-sized chunks. That worked fine when all specs took a similar amount
// of time, but a handful of specs (chart_view.cy.js, map_view.cy.js) run
// several dataset-creation + datapusher flows and take much longer than the
// rest, which made whichever group they landed in the slowest runner in the
// CI matrix. Those two are now isolated into their own group so no other
// spec has to wait behind them.
const GROUPS = [
  ['accesibility_test.cy.js', 'api_tokens.cy.js', 'applicatoin_crud.cy.js'],
  ['chart_view.cy.js'],
  ['approval_review_unauthorized.cy.js', 'auth.cy.js', 'dashboard.cy.js'],
  ['datafile_location_index.cy.js', 'datafile_not_downloadable.cy.js', 'datapusher.cy.js'],
  ['dataset_create_and_read.cy.js', 'dataset_permissions.cy.js', 'external_sources.cy.js'],
  ['file-conversion.cy.js', 'group_org_patch.cy.js', 'home.cy.js'],
  ['map_view.cy.js'],
  ['private_teams.cy.js', 'release_notes.cy.js'],
  ['robots_txt.cy.js', 'search.cy.js', 'tabbing_accessibility_forms.cy.js'],
  ['team_crud.cy.js', 'teams_public_private_permissions.cy.js', 'topic_crud.cy.js'],
  ['topics.cy.js', 'user_management.cy.js', 'user_management_cascading_roles.cy.js', 'web_search_indexing.cy.js'],
];

// Get group configuration from command line arguments
const groupIndex = parseInt(process.argv[2]) || 1; // Which group to run (1-based)
const totalGroups = GROUPS.length;

if (groupIndex < 1 || groupIndex > totalGroups) {
  throw new Error(`Group ${groupIndex} is out of range. There are ${totalGroups} groups defined.`);
}

const groupFiles = GROUPS[groupIndex - 1];

// Build the spec pattern
const specPattern = groupFiles.map(file => `cypress/e2e/${file}`).join(',');

// IMPORTANT: this script's output is captured via `$(node split-tests.js N)`
// in package.json, so stdout must contain ONLY the spec pattern. Diagnostic
// logging must go to stderr (console.error), otherwise it gets appended to
// the captured string and breaks Cypress's glob matching.
console.error(`Running group ${groupIndex} of ${totalGroups}`);
console.error(`Tests in this group (${groupFiles.length}): ${groupFiles.join(', ')}`);
console.error(`Spec pattern: ${specPattern}`);

// Output the spec pattern for Cypress to use
process.stdout.write(specPattern);
