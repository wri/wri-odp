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
    cy.get("input[name=author]").type("Luccas");
    cy.get("input[name=author_email]").type("luccasmmg@gmail.com");
    cy.get("input[name=maintainer]").type("Luccas");
    cy.get("input[name=maintainer_email]").type("luccasmmg@gmail.com");
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
