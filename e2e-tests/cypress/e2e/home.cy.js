const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

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
const topic1 = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}_topic_1`;
const topic2 = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}_topic_2`;

describe("Home page", () => {
  before(() => {
    // Create orgs
    [...new Array(2).keys()].map((k) => {
      const name = getRandomOrganizationName();
      cy.createOrganizationAPI(name);
      orgs.push(name);
    });

    cy.createGroupAPI(topic1)
      .then((response) => {
        cy.log(response.body);
      })
      .then(() => {
        return cy.createGroupAPI(topic2);
      })
      .then((response) => {
        [...new Array(2).keys()].map((k, i) => {
          const name = getRandomDatasetName();
          cy.createDatasetAPI(i < 7 ? orgs[0] : orgs[1], name, true, {
            groups: [
              { name: topic1 },
              { name: topic2 },
            ],
            featured_dataset: true,
            tags: i < 7 ? [{ name: "tags 1" }] : [{ name: "tags 2" }],
            temporal_coverage_start: i < 7 ? 2005 : 2010,
            temporal_coverage_end: i < 7 ? 2010 : 2012,
            update_frequency: i < 7 ? "annually" : "daily",
            language: i < 7 ? "en" : "pt",
            wri_data: i < 7 ? true : false,
            private: false,
            visibility_type: "public",
          });
          cy.approvePendingDatasetAPI(name);
          datasets.push(name);
        });
      });
  });

  it("display home page", () => {
    cy.visit("/");
    cy.contains("Data Explorer - Beta");
    cy.contains("Highlights");
  });

  it("allow searches", () => {
    cy.visit("/search");
    cy.get('[name="search"]').type(datasets[0] + "{enter}" ?? "test");

    cy.url().should("include", "search_advanced");
    cy.contains("results", { timeout: 40000 });
    cy.contains(`Search: ${datasets[0]}`, { timeout: 90040000 });
    cy.contains(`${datasets[0]}`, { timeout: 40000 });
  });

  it("contains topics", () => {
    cy.viewport(1440, 2800);
    cy.visit("/");
    cy.contains("Topics");
    cy.contains(topic1);
    cy.contains(topic2);
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
    //datasets.forEach((name) => cy.deleteDatasetAPI(name));
    //datasets.forEach((name) => cy.purgeDataset(name));
    //cy.deleteGroupAPI(topic1);
    //cy.deleteGroupAPI(topic2);
    //cy.purgeGroup(topic1);
    //cy.purgeGroup(topic2);
    //orgs.forEach((name) => cy.deleteOrganizationAPI(name));
    //orgs.forEach((name) => cy.purgeOrganization(name));
  });
});
