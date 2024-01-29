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
    cy.createOrganizationAPI(parentOrg);
    cy.createDatasetAPI(parentOrg, datasetName, true, {
      visibility_type: "public",
      technical_notes: "http://google.com",
    });

    cy.createResourceAPI(datasetName, {
      name: "Data File 1",
      format: "csv",
      url_type: "link",
      url: "https://people.sc.fsu.edu/~jburkardt/data/csv/airtravel.csv",
    });

    cy.login(ckanUserName, ckanUserPassword);
    cy.visit("/dashboard/datasets/" + datasetName + "/edit");
    cy.contains("Data Files").click();
    cy.contains("Datapusher").click();
    cy.contains("Submit to Datapusher").click();
    cy.contains(`Successfully submited resource to the datapusher`, {
      timeout: 15000,
    });
    cy.wait(15000);
    cy.contains("DATAPUSHER+ JOB DONE!", { timeout: 15000 });
  });

  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it(
    "should be creatable from the UI",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/dashboard/datasets/${datasetName}/edit`);

      cy.contains("Data Files", { timeout: 20000 }).click({ force: true });

      cy.contains("Views").first().click();

      cy.contains("Add a view").click();

      cy.contains("Chart").click();

      cy.contains("Add a chart view", { timeout: 40000 })
        .parent()
        .as("chart-container");

      cy.get('[name="title"]').type("This is my new chart");

      cy.get("@chart-container").contains("Data").click({ force: true });

      cy.get("@chart-container").get("#dimension").click({ force: true });

      cy.get("@chart-container").contains("Month").click({ force: true });

      cy.get("@chart-container").get("#measure").click({ force: true });

      cy.get("@chart-container").contains("1958").click({ force: true });

      cy.get("@chart-container")
        .contains("Update Preview")
        .click({ force: true });

      cy.wait(5000)

      cy.get("@chart-container")
        .contains("Add to Views")
        .click({ force: true, timeout: "60000" });

      cy.contains("successfully", { timeout: 30000 });

      cy.visit(`/dashboard/datasets/${datasetName}/edit`);

      cy.contains("Data Files", { timeout: 20000 }).click({ force: true });

      cy.contains("Views").first().click();

      cy.contains("This is my new chart");
    },
  );

  it(
    "should be editable from the UI",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/dashboard/datasets/${datasetName}/edit`);

      cy.contains("Data Files", { timeout: 20000 }).click({ force: true });

      cy.contains("Views").first().click();

      cy.contains("This is my new chart").click({ force: true });

      cy.contains("Edit the chart view", { timeout: 40000 })
        .parent()
        .as("chart-container");

      cy.get('[name="title"]').clear().type("This is my awesome chart");

      cy.get("@chart-container")
        .contains("Update Preview")
        .click({ force: true });

      cy.get("@chart-container")
        .contains("Update View")
        .click({ force: true, timeout: "60000" });

      cy.visit(`/dashboard/datasets/${datasetName}/edit`);

      cy.contains("Data Files", { timeout: 20000 }).click({ force: true });

      cy.contains("Views").first().click();

      cy.contains("This is my awesome chart");
    },
  );

  it(
    "should be accessible throught the dataset page",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/datasets/${datasetName}`);

      cy.contains("Add Chart View").click({ force: true });

      cy.contains("This is my awesome chart")
    },
  );

  after(() => {
    cy.deleteDatasetAPI(datasetName);
    cy.deleteOrganizationAPI(parentOrg);
  });
});
