const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;

// TODO: this test is not robust enoguh
describe("Data files", () => {
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
  });

  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it(
    "Submit datapusher",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/dashboard/datasets/" + datasetName + "/edit");
      cy.contains("Data Files").click();
      cy.contains("Datapusher").click();
      cy.contains("Submit to Datapusher").click();
      cy.contains(`Successfully submited datafile to the datapusher`, {
        timeout: 15000,
      });
      cy.wait(15000);
      cy.contains("DATAPUSHER+ JOB DONE!", { timeout: 15000 });
    },
  );

  it(
    "should be downloadable from the dataset page",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/datasets/${datasetName}`);

      cy.contains("Data File 1").click({ force: true });
      cy.contains("Download").click({force: true})
      cy.contains("Original Format")
    },
  );

  after(() => {
    cy.deleteDatasetAPI(datasetName);
    cy.deleteOrganizationAPI(parentOrg);
  });
});

