const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");

const uuid = () => Math.random().toString(36).slice(2) + "-test";
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const dataset = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;

function waitForDatastoreActive(resourceId, attemptsLeft = 40) {
  cy.request({
    method: "GET",
    url: `${Cypress.config().apiUrl}/api/3/action/resource_show`,
    headers: { Authorization: Cypress.env("API_KEY") },
    qs: { id: resourceId },
  }).then((res) => {
    if (res.body.result.datastore_active) {
      return;
    }
    if (attemptsLeft <= 0) {
      throw new Error("datastore_active never became true");
    }
    cy.wait(3000);
    waitForDatastoreActive(resourceId, attemptsLeft - 1);
  });
}

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
      }).then((resource) => {
        Cypress.env("DATAPUSHER_RESOURCE_ID", resource.id);
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
      // Never match bare "COMPLETED" — the status Badge renders that word and
      // caused false passes (~1.5s) before the Prefect job actually finished.
      cy.get("body").then(($body) => {
        const done =
          $body.text().includes("Finished in state Completed()") ||
          $body.text().includes("DATAPUSHER+ JOB DONE!");
        if (done) {
          return;
        }
        cy.contains("Submit to Datapusher", { timeout: 50000 }).click();
        cy.contains(`Successfully submited Data File to the datapusher`, {
          timeout: 15000,
        });
      });
      cy.contains(/Finished in state Completed\(\)|DATAPUSHER\+ JOB DONE!/, {
        timeout: 120000,
      });

      waitForDatastoreActive(Cypress.env("DATAPUSHER_RESOURCE_ID"));

      // If upload created a pending revision, promote it for the public page.
      // API uploads onto an already-approved package often have no pending.
      cy.datasetMetadata(dataset).then((pkg) => {
        cy.request({
          method: "GET",
          url: `${Cypress.config().apiUrl}/api/3/action/pending_dataset_show`,
          headers: { Authorization: Cypress.env("API_KEY") },
          qs: { package_id: pkg.id },
          failOnStatusCode: false,
        }).then((pendingRes) => {
          if (pendingRes.body?.success) {
            cy.approvePendingDatasetAPI(dataset);
          }
        });
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
      cy.get("body").then(($body) => {
        if ($body.find("#toggle-version").length) {
          cy.get("#toggle-version").click();
        }
      });
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
