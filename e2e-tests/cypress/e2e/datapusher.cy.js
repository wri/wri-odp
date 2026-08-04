const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");

const uuid = () => Math.random().toString(36).slice(2) + "-test";
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const dataset = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;

describe("Datapusher", () => {
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  before(() => {
    cy.createOrganizationAPI(org);
    cy.createDatasetAPI(org, dataset, true, {
      private: false,
      visibility_type: "public",
      short_description: "datapusher e2e",
    });
    // Approve before attaching a file: package_create snapshots pending
    // without resources; approving later would wipe an uploaded file.
    cy.approvePendingDatasetAPI(dataset);
    cy.datasetMetadata(dataset).then((pkg) => {
      cy.task("uploadResourceFile", {
        apiUrl: Cypress.config().apiUrl,
        apiKey: Cypress.env("API_KEY"),
        packageId: pkg.id,
        fixturePath: "cypress/fixtures/cities.csv",
        format: "CSV",
      });
    });
  });

  it(
    "Submit datapusher",
    {
      retries: {
        runMode: 2,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/dashboard/datasets/" + dataset + "/edit");
      cy.contains("Data Files", { timeout: 20000 }).click();
      cy.get(".datafile-accordion-trigger", { timeout: 15000 }).eq(0).click();
      cy.contains("Datapusher").click();
      cy.get("body").then(($body) => {
        const done =
          $body.text().includes("Finished in state Completed()") ||
          $body.text().includes("COMPLETED") ||
          $body.text().includes("DATAPUSHER+ JOB DONE!");
        if (done) {
          return;
        }
        cy.contains("Submit to Datapusher", { timeout: 50000 }).click();
        cy.contains(`Successfully submited Data File to the datapusher`, {
          timeout: 15000,
        });
      });
      // Prefect flow logs (current UI) — legacy badge text kept as fallback
      cy.contains(/Finished in state Completed\(\)|COMPLETED|DATAPUSHER\+ JOB DONE!/, {
        timeout: 120000,
      });
    },
  );

  it(
    "Should show the tabular preview",
    {
      retries: {
        runMode: 2,
        openMode: 0,
      },
    },
    () => {
      cy.viewport(1440, 900);
      cy.visit("/datasets/" + dataset);
      cy.contains("01D2539e270CEbd", { timeout: 30000 });
      cy.contains("Download Data").click();
      cy.get("#download-subset-csv").click();
      cy.contains("Submit", { timeout: 15000 });
    },
  );

  after(() => {
    const api = `${Cypress.config().apiUrl}/api/3/action`;
    const headers = { Authorization: Cypress.env("API_KEY") };
    cy.request({
      method: "POST",
      url: `${api}/package_delete`,
      headers,
      body: { id: dataset },
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
