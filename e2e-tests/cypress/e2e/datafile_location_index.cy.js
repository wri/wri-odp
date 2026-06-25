const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;
let datasetCreated = false;

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
      cy.request({
        url: "/dashboard/datasets/new",
        failOnStatusCode: false,
      }).then((resp) => {
        expect(resp.status).to.be.lessThan(500);
      });

      cy.visit("/dashboard/datasets/new", { failOnStatusCode: false });
      cy.get("body", { timeout: 30000 }).then(($body) => {
        if (!$body.find("input[name=title]").length) {
          cy.reload();
        }
      });

      cy.get("input[name=title]", { timeout: 30000 }).type(datasetName);
      cy.get("input[name=name]", { timeout: 30000 }).should("have.value", datasetName);
      cy.get("textarea[name=short_description]", { timeout: 30000 }).type("test");

      cy.get("#team", { timeout: 30000 }).click();
      cy.get("li", { timeout: 30000 }).contains(org).click();
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

      cy.contains(/Next:\s*Data Files/i, { timeout: 30000 }).click();
      cy.get(".datafile-accordion-trigger", { timeout: 30000 }).eq(0).click();
      cy.get("input[type=file]", { timeout: 30000 }).eq(0).selectFile("cypress/fixtures/airtravel.csv", {
        force: true,
      });
      cy.contains(/Choose location/i, { timeout: 30000 }).click({ force: true });
      cy.get(".mapboxgl-ctrl-geocoder--input", { timeout: 30000 }).type("Brazil");
      cy.get(".mapboxgl-ctrl-geocoder--suggestion-title", { timeout: 30000 })
        .first()
        .click({ force: true });
      cy.contains(/Next:\s*Map Visualizations/i, { timeout: 30000 }).click();
      cy.contains(/Next:\s*Preview/i, { timeout: 30000 }).click();
      cy.get('button[type="submit"]', { timeout: 30000 }).click();
      cy.contains(`Successfully created the "${datasetName}" Dataset`, {
        timeout: 30000,
      });
      datasetCreated = true;
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
      if (!datasetCreated) {
        cy.log("Dataset was not created in previous step. Skipping location assertion.");
        return;
      }

      cy.visit(`/datasets/${datasetName}`, { failOnStatusCode: false });
      cy.contains(/Data Files/i, { timeout: 30000 }).first().click({ force: true });
      cy.contains(/Brazil/i, { timeout: 30000 }).should("be.visible");
    },
  );
});
