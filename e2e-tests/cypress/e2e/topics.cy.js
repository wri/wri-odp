const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");

const getRandomDatasetName = () =>
  Math.random().toString(36).slice(2) + Cypress.env("DATASET_NAME_SUFFIX");
const getRandomOrganizationName = () =>
  Math.random().toString(36).slice(2) + Cypress.env("ORG_NAME_SUFFIX");
const getRandomGroupName = () =>
  Math.random().toString(36).slice(2) + Cypress.env("GROUP_NAME_SUFFIX");

const subgroup = "subtopic" + getRandomGroupName();

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

describe("Explore data page", () => {
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

    // sub group
    cy.createGroupAPI(subgroup, groups[0]);

    // Create datasets
    [...new Array(14).keys()].map((k, i) => {
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
      });
      datasets.push(name);
    });
  });


  it("search topic", () => {
    cy.visit("/topics");
    cy.wait(2000);
    cy.get('[name="search"]').type(groups[0] + "{enter}" ?? "test");
    cy.contains(`${groups[0]}`, { timeout: 40000 });
  });
    
  it("search teams", () => {
    cy.visit("/teams");
    cy.wait(2000);
    cy.get('[name="search"]').type(orgs[0] + "{enter}" ?? "test");
    cy.contains(`${orgs[0]}`, { timeout: 40000 });
  });
    
  it("visit topic page", () => {
    cy.visit(`/topics/${groups[0]}`);
    cy.contains(`${groups[0]}`, { timeout: 40000 });
    // cy.contains("Edit", { timeout: 2000 });
    cy.contains("Subtopics")
  });

  it("should display not found page", () => {
    cy.visit("/topics/randomtopicname");
    cy.contains("Sorry, we couldn’t find the page you’re looking for.", { timeout: 40000 });
  });

  it("shoud display subtopic page", () => {
    cy.visit(`/topics/${subgroup}`);
    cy.contains(`${subgroup}`, { timeout: 40000 });
  });

  after(() => {
    // Delete and purge datasets
    datasets.forEach((name) => cy.deleteDatasetAPI(name));
    // datasets.forEach((name) => cy.purgeDataset(name));

    cy.deleteGroupAPI(subgroup);
    groups.forEach((name) => cy.deleteGroupAPI(name));
    groups.forEach((name) => cy.purgeGroup(name));

    orgs.forEach((name) => cy.deleteOrganizationAPI(name));
    orgs.forEach((name) => cy.purgeOrganization(name));
  });
});
