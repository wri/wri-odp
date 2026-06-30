const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;

describe("Data File location", () => {
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  before(() => {
    cy.createOrganizationAPI(org);
  });

  it(
    "can be specified when creating a new data file",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/dashboard/datasets/new");
      cy.contains("h1", "Add a Dataset", { timeout: 20000 }).should("be.visible");

      cy.get('input[name="title"], input[placeholder="My Dataset"]', {
        timeout: 20000,
      })
        .first()
        .type(datasetName);

      cy.get('input[name="name"], input[placeholder="name-of-dataset"]', {
        timeout: 10000,
      })
        .first()
        .should("have.value", datasetName);

      cy.get('textarea[name="short_description"], textarea[aria-label="Short Description"]', {
        timeout: 10000,
      })
        .first()
        .type("test");

      cy.get("#team").click();
      cy.contains("li", org, { timeout: 20000 }).click();
      cy.contains("Add Author").click();
      cy.get('input[name="authors.0.name"]').type("Test Author 1");
      cy.get('input[name="authors.0.email"]').type("test-author-1@example.com");
      cy.contains("Add Author").click();
      cy.get('input[name="authors.1.name"]').type("Test Author 2");
      cy.get('input[name="authors.1.email"]').type("test-author-2@example.com");

      cy.contains("Add Maintainer").click();
      cy.get('input[name="maintainers.0.name"]').type("Test Maintainer 1");
      cy.get('input[name="maintainers.0.email"]').type(
        "test-maintainer-1@example.com",
      );
      cy.contains("Add Maintainer").click();
      cy.get('input[name="maintainers.1.name"]').type("Test Maintainer 2");
      cy.get('input[name="maintainers.1.email"]').type(
        "test-maintainer-2@example.com",
      );

      cy.contains("Next: Data Files").click();
      cy.get(".datafile-accordion-trigger").eq(0).click();
      cy.get("input[type=file]").selectFile("cypress/fixtures/airtravel.csv", {
        force: true,
      });
      cy.contains("Choose location").click({ force: true });
      cy.get(".mapboxgl-ctrl-geocoder--input", { timeout: 20000 })
        .should("be.visible")
        .type("Brazil");
      cy.get(".mapboxgl-ctrl-geocoder--suggestion-title", { timeout: 20000 })
        .contains("Brazil")
        .first()
        .click();
      cy.get(".mapboxgl-ctrl-geocoder--input", { timeout: 20000 }).should(
        "contain.value",
        "Brazil"
      );
      cy.contains("Next: Map Visualizations").click();
      cy.contains("Next: Preview").click();
      cy.get('button[type="submit"]').click();
      cy.contains(`Successfully created the "${datasetName}" Dataset`, {
        timeout: 20000,
      });
    },
  );

  it(
    "can be viewed on the data files section for a dataset",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/datasets/${datasetName}`);
      cy.contains("Brazil");
    },
  );
});
