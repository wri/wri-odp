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
        visibility_type: "public",
      }).then((response) => {
        cy.approvePendingDatasetAPI(name);
        datasets.push(name);
      });
    });
  });

  it(
    "displays all facets",
    {
      retries: {
        runMode: 3,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/search");
      cy.get("#facets-list", { timeout: 20000 }).as("facets-list");

      for (let facet of facets) {
        cy.get("@facets-list").contains(facet);
      }
    },
  );

  it(
    "allows filtering by facets",
    {
      retries: {
        runMode: 3,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/search");
      cy.get("#facets-list", { timeout: 20000 }).as("facets-list");

      cy.get("@facets-list").contains("Team").click({ force: true });

      cy.get('[id^="facet-organization-"]').first().click({ force: true });

      cy.contains("results", { timeout: 10000 });
    },
  );

  it("allows filtering by search query", () => {
    cy.visit("/search");
    cy.get('[name="search"]').type(datasets[0] ?? "test");

    cy.contains("results", { timeout: 10000 });
  });

  it("allows faceting by last updated since and before dates", () => {
    cy.visit("/search");
    cy.viewport(1440, 900);

    const getLastUpdatedFacet = () =>
      cy
        .contains("#facets-list [role='listitem'] p", "Last Updated", {
          timeout: 30000,
        })
        .closest("[role='listitem']");

    const ensureLastUpdatedFacetOpen = () => {
      getLastUpdatedFacet()
        .find("button[aria-expanded]", { timeout: 30000 })
        .first()
        .then(($button) => {
          if ($button.attr("aria-expanded") !== "true") {
            cy.wrap($button).click({ force: true });
          }
        });

      getLastUpdatedFacet()
        .find("button[aria-expanded]", { timeout: 30000 })
        .first()
        .then(($button) => {
          if ($button.attr("aria-expanded") !== "true") {
            cy.wrap($button).click({ force: true });
          }
        });

      getLastUpdatedFacet()
        .find("button[aria-expanded]", { timeout: 30000 })
        .first()
        .should("have.attr", "aria-expanded", "true");

      getLastUpdatedFacet().within(() => {
        cy.get("#since-date", { timeout: 30000 }).should("exist");
        cy.get("#before-date", { timeout: 30000 }).should("exist");
      });
    };

    const setDateRange = (sinceDateFormatted, beforeDateFormatted) => {
      ensureLastUpdatedFacetOpen();

      // Re-query each field between clear/type to avoid detached element issues on re-render.
      cy.get("#since-date", { timeout: 30000 }).clear({ force: true });
      cy.get("#since-date", { timeout: 30000 })
        .type(sinceDateFormatted, { force: true, timeout: 10000 });

      cy.get("#before-date", { timeout: 30000 }).clear({ force: true });
      cy.get("#before-date", { timeout: 30000 })
        .type(beforeDateFormatted, { force: true, timeout: 10000 });
    };

    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const combinations = [
      { since: yesterday, before: today, results: true },
      { since: today, before: tomorrow, results: true },
      { since: today, before: today, results: true },
      { since: tomorrow, before: tomorrow, results: null },
      { since: today, before: yesterday, results: null },
      { since: yesterday, before: yesterday, results: false },
    ];

    cy.wrap(combinations).each((combination) => {
      const sinceDateFormatted = combination.since.toISOString().split("T")[0];
      const beforeDateFormatted = combination.before
        .toISOString()
        .split("T")[0];

      if (combination.results === null) {
        cy.once("window:alert", (message) => {
          expect(message).to.contains("Invalid date range");
        });
      }

      setDateRange(sinceDateFormatted, beforeDateFormatted);

      if (combination.results === true) {
        cy.get("body", { timeout: 10000 }).contains("results");
      } else {
        cy.get("body", { timeout: 10000 }).contains("0 results");
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
