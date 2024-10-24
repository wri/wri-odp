const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;

describe("Chart view", () => {
  it("Should create dataset", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.visit("/dashboard/datasets/new");
    cy.get("input[name=title]").type(datasetName);
    cy.get("input[name=name]").should("have.value", datasetName);
    cy.get("textarea[name=short_description]").type("test");

    cy.contains("Add Author").click();
    cy.get('input[name="authors.0.name"]').type("Test Author 1");
    cy.get('input[name="authors.0.email"]').type("test-author-1@example.com");
    cy.contains("Add Author").click();
    cy.get('input[name="authors.1.name"]').type("Test Author 2");
    cy.get('input[name="authors.1.email"]').type("test-author-2@example.com");

    cy.contains("Add Maintainer").click();
    cy.get('input[name="maintainers.0.name"]').type("Test Maintainer 1");
    cy.get('input[name="maintainers.0.email"]').type("test-maintainer-1@example.com");
    cy.contains("Add Maintainer").click();
    cy.get('input[name="maintainers.1.name"]').type("Test Maintainer 2");
    cy.get('input[name="maintainers.1.email"]').type("test-maintainer-2@example.com");

    cy.contains("Next: Datafiles").click();
    cy.get("input[type=file]").eq(0).selectFile("cypress/fixtures/airtravel.csv", {
      force: true,
    });
    cy.wait(5000);
    cy.contains("Next: Map Visualizations").click();
    cy.contains("Next: Preview").click();
    cy.get('button[type="submit"]').click();
    cy.contains(`Successfully created the "${datasetName}" dataset`, {
      timeout: 20000,
    });
  });

  it(
    "should not be accessible for non logged in users",
    {
      retries: {
        runMode: 10,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/datasets/${datasetName}`);
      cy.contains("Dataset not found")
    },
  );
  it(
    "should be accessible for logged in users",
    {
      retries: {
        runMode: 10,
        openMode: 0,
      },
    },
    () => {
      cy.login(ckanUserName, ckanUserPassword);
      cy.visit(`/datasets/${datasetName}`);
      cy.contains(datasetName)
    },
  );
});
