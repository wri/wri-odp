const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");

const getRandomDatasetName = () =>
  Math.random().toString(36).slice(2) + Cypress.env("DATASET_NAME_SUFFIX");
const getRandomOrganizationName = () =>
  Math.random().toString(36).slice(2) + Cypress.env("ORG_NAME_SUFFIX");
const getRandomGroupName = () =>
  Math.random().toString(36).slice(2) + Cypress.env("GROUP_NAME_SUFFIX");

const orgs = [];
const groups = [];
const datasets = [];

const headers = { Authorization: Cypress.env("API_KEY") };

const facets = [
  "Location",
  "Featured",
  "Application",
  "Project",
  "Team",
  "Topics",
  "Tags",
  "Temporal Coverage",
  "Update Frequency",
  "Format",
  "License",
  "Language",
  "WRI Data",
];

describe("Search page", () => {
  before(() => {
    // Create orgs
    [...new Array(2).keys()].map((k) => {
      const name = getRandomOrganizationName();
      cy.createOrganizationAPI(name);
      orgs.push(name);
    });

    // Create groups
    [...new Array(2).keys()].map((k) => {
      const name = getRandomGroupName();
      cy.createGroupAPI(name);
      groups.push(name);
    });

    // Create datasets
    [...new Array(14).keys()].map((k, i) => {
      const name = getRandomDatasetName();
      cy.createDatasetAPI(i < 7 ? orgs[0] : orgs[1], name, true, {
        groups: [{ name: i < 7 ? groups[0] : groups[1] }],
        featured_dataset: i < 7 ? true : false,
        application: i < 7 ? "Application 1" : "Application 2",
        tags: i < 7 ? [{ name: "tags 1" }] : [{ name: "tags 2" }],
        temporal_coverage_start: i < 7 ? 2005 : 2010,
        temporal_coverage_end: i < 7 ? 2010 : 2012,
        update_frequency: i < 7 ? "annually" : "daily",
        language: i < 7 ? "en" : "pt",
        wri_data: i < 7 ? true : false,
      });
      datasets.push(name);
    });
  });

  it("displays all facets", () => {
    cy.visit("/search_advanced");
    cy.get("#facets-list", { timeout: 20000 }).as("facets-list");

    for (let facet of facets) {
      cy.get("@facets-list").contains(facet);
    }
  });

  it("allows filtering by facets", () => {
    cy.visit("/search_advanced");
    cy.get("#facets-list", { timeout: 20000 }).as("facets-list");

    cy.get("@facets-list").contains("Team").click({ force: true });

    cy.get('[id^="facet-organization-"]').first().click({ force: true });

    cy.contains("results", { timeout: 10000 });
  });

  it("allows filtering by search query", () => {
    cy.visit("/search_advanced");
    cy.get('[name="search"]').type(datasets[0] ?? "test");

    cy.contains("results", { timeout: 10000 });
  });

  it("allows faceting by last updated since and before dates", () => {
    cy.visit("/search_advanced");
    cy.contains("Open sidebar").click();
    cy.get("#facets-list")
    cy.contains("Last Updated").focus().click({ force: true });

    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const combinations = [
      { since: yesterday, before: today, results: true },
      { since: today, before: tomorrow, results: true },
      { since: today, before: today, results: true },
      { since: tomorrow, before: tomorrow, results: null },
      { since: today, before: yesterday, results: null },
      { since: yesterday, before: yesterday, results: false }
    ];

    combinations.forEach((combination) => {
      const sinceDateFormatted = combination.since.toISOString().split('T')[0];
      const beforeDateFormatted = combination.before.toISOString().split('T')[0];

      cy.get("#since-date").type(sinceDateFormatted, { force: true });
      cy.get("#before-date").type(beforeDateFormatted, { force: true });

      if (combination.results === true) {
        cy.contains("results", { timeout: 10000 });
      } else if (combination.results === null) {
        cy.on("window:alert", (message) => {
          expect(message).to.contains("Invalid date range");
        });
      } else {
        cy.contains("0 results", { timeout: 10000 });
      }
    });
  });

  after(() => {
    // Delete and purge datasets
    datasets.forEach((name) => cy.deleteDatasetAPI(name));
    // datasets.forEach((name) => cy.purgeDataset(name));

    groups.forEach((name) => cy.deleteGroupAPI(name));
    groups.forEach((name) => cy.purgeGroup(name));

    orgs.forEach((name) => cy.deleteOrganizationAPI(name));
    orgs.forEach((name) => cy.purgeOrganization(name));
  });
});
