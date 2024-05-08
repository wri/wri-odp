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

describe("Home page", () => {
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
    [...new Array(2).keys()].map((k, i) => {
      const name = getRandomDatasetName();
      cy.createDatasetAPI(i < 7 ? orgs[0] : orgs[1], name, true, {
        groups: [{ name: i < 7 ? groups[0] : groups[1] }],
        featured_dataset: true,
        application: i < 7 ? "Application 1" : "Application 2",
        tags: i < 7 ? [{ name: "tags 1" }] : [{ name: "tags 2" }],
        temporal_coverage_start: i < 7 ? 2005 : 2010,
        temporal_coverage_end: i < 7 ? 2010 : 2012,
        update_frequency: i < 7 ? "annually" : "daily",
        language: i < 7 ? "en" : "pt",
        wri_data: i < 7 ? true : false,
        featured_dataset: true,
        visibility_type: 'public'
      });
      datasets.push(name);
    });
  });

  it("display home page", () => {
    cy.visit("/");
    cy.contains("Welcome to WRI Data Explorer");
    cy.contains("Highlights");
  });

 
  it("allow searches", () => {
    cy.visit("/search");
    cy.get('[name="search"]').type(datasets[0] + "{enter}" ?? "test");

    cy.url().should("include", "search_advanced");
    cy.contains("results", { timeout: 40000 });
    cy.contains(`Search: ${datasets[0]}`, { timeout: 40000 });
    cy.contains(`${datasets[0]}`, { timeout: 40000 });
  });
    
  it("contains topics", () => {
    cy.visit("/");
    cy.contains("Topics");
    groups.forEach((group) => {
      cy.contains(group);
    });
  });
    
 it("contains highlights", () => {
    cy.visit("/");
    cy.contains("Highlights");
    datasets.forEach((dataset) => {
        cy.contains(dataset);
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
