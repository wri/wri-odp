const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;

describe("Chart view", () => {
  before(() => {
    cy.createOrganizationAPI(org);
  });

  it("Should create dataset", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.visit("/dashboard/datasets/new");
    cy.get("input[name=title]").type(datasetName);
    cy.get("input[name=name]").should("have.value", datasetName);
    cy.get("textarea[name=short_description]").type("test");

    cy.get("#team", { timeout: 15000 }).should("be.visible").click();
    cy.contains('[role="option"]', org).click();

    cy.contains("Add data maintainer").click();
    cy.get('input[name="maintainers.0.name"]').type("Test Maintainer 1");
    cy.get('input[name="maintainers.0.email"]').type(
      "test-maintainer-1@example.com",
    );
    cy.contains("Add data maintainer").click();
    cy.get('input[name="maintainers.1.name"]').type("Test Maintainer 2");
    cy.get('input[name="maintainers.1.email"]').type(
      "test-maintainer-2@example.com",
    );

    cy.contains("Next: Data Files").click();
    cy.contains("Add another Data File", { timeout: 15000 }).should("be.visible");
    cy.get(".datafile-accordion-trigger", { timeout: 15000 }).eq(0).click();
    cy.get("input[type=file]")
      .eq(0)
      .selectFile("cypress/fixtures/airtravel.csv", {
        force: true,
      });
    cy.contains("airtravel.csv", { timeout: 30000 }).should("be.visible");
    cy.contains("Next: Map Visualizations").click();
    cy.contains("Next: Preview").click();
    cy.get('button[type="submit"]').click();
    cy.contains(`Successfully created the "${datasetName}" Dataset`, {
      timeout: 20000,
    });
  });

  it(
    "should not be accessible for non logged in users",
    {
      retries: {
        runMode: 3,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/datasets/${datasetName}`);
      cy.contains("Dataset not found");
    },
  );
  it(
    "should be accessible for logged in users",
    {
      retries: {
        runMode: 3,
        openMode: 0,
      },
    },
    () => {
      cy.login(ckanUserName, ckanUserPassword);
      cy.visit(`/datasets/${datasetName}`);
      cy.contains(datasetName);
    },
  );
});
