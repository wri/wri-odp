const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;

describe("Data File not downloadable", () => {
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  before(() => {
    cy.createOrganizationAPI(org);
  });

  it(
    "can be specified when creating a new data file and viewed on the dataset",
    {
      retries: {
        runMode: 2,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/dashboard/datasets/new");
      cy.get("input[name=title]").type(datasetName);
      cy.get("input[name=name]").should("have.value", datasetName);
      cy.get("textarea[name=short_description]").type("test");

      cy.get("#team", { timeout: 15000 }).should("be.visible").click();
      cy.get('[role="listbox"]').should("be.visible");
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
      cy.get(".datafile-accordion-trigger").eq(0).click();
      cy.contains("Link to file in cloud storage").click();
      cy.get('input[name="resources.0.url"]').type(
        "https://www.stats.govt.nz/assets/Uploads/Business-employment-data/Business-employment-data-December-2024-quarter/Download-data/business-employment-data-march-2024-quarter.zip ",
      );
      cy.get('input[name="resources.0.title"]')
        .clear()
        .type("Not downloadable file");
      cy.get('input[name="resources.0.not_downloadable"]').check();
      cy.contains("Add another Data File").click();
      cy.get(".datafile-accordion-trigger").eq(0).click();
      cy.get(".datafile-accordion-trigger").eq(1).click();
      cy.contains("Link to file in cloud storage").click();
      cy.get('input[name="resources.1.url"]').type(
        "https://www.stats.govt.nz/assets/Uploads/Business-employment-data/Business-employment-data-December-2024-quarter/Download-data/business-employment-data-march-2024-quarter.zip ",
      );
      cy.get('input[name="resources.1.title"]').type("Downloadable file");
      cy.contains("Next: Map Visualizations").click();
      cy.contains("Next: Preview").click();
      cy.get('button[type="submit"]').click();
      cy.contains(`Successfully created the "${datasetName}" Dataset`, {
        timeout: 20000,
      });

      cy.visit(`/datasets/${datasetName}`);
      cy.contains("Not downloadable file").click();
      cy.contains("Access the Data");
      cy.contains("Downloadable file").click();
      cy.contains("Download");
    },
  );

  after(() => {
    const api = `${Cypress.config().apiUrl}/api/3/action`;
    const headers = { Authorization: Cypress.env("API_KEY") };
    cy.request({
      method: "POST",
      url: `${api}/package_delete`,
      headers,
      body: { id: datasetName },
      failOnStatusCode: false,
    });
    cy.request({
      method: "POST",
      url: `${api}/organization_delete`,
      headers,
      body: { id: org },
      failOnStatusCode: false,
    });
  });
});
