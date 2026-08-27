const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");

const uuid = () => Math.random().toString(36).slice(2) + "-test";
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const dataset = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;

function waitForDatastoreActive(datasetName, retries = 30) {
  return cy
    .request({
      method: "GET",
      url: `${Cypress.config().apiUrl}/api/3/action/package_show`,
      headers: { Authorization: Cypress.env("API_KEY") },
      qs: { id: datasetName },
      failOnStatusCode: false,
    })
    .then((res) => {
      const resources = res.body?.result?.resources ?? [];
      const hasDatastore = resources.some((r) => r.datastore_active === true);

      if (hasDatastore) return;
      if (retries <= 0) {
        throw new Error("Timed out waiting for datastore_active=true");
      }

      cy.wait(2000);
      return waitForDatastoreActive(datasetName, retries - 1);
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
      waitForDatastoreActive(dataset);

      cy.datasetMetadata(dataset).then((pkg) => {
        const tabularResource = (pkg.resources ?? []).find(
          (resource) => resource.datastore_active === true,
        );
        expect(tabularResource, "datastore_active resource").to.exist;

        cy.request({
          method: "POST",
          url: `${Cypress.config().apiUrl}/api/3/action/datastore_search`,
          headers: { Authorization: Cypress.env("API_KEY") },
          body: {
            resource_id: tabularResource.id,
            limit: 10,
          },
        }).then((response) => {
          expect(response.body?.success).to.eq(true);
          const records = response.body?.result?.records ?? [];
          expect(records.length).to.be.greaterThan(0);
          expect(JSON.stringify(records)).to.contain("Beck LLC");
        });
      });

      cy.visit("/datasets/" + dataset);
      cy.get("h1", { timeout: 30000 }).contains(dataset);
      cy.contains("Data Files").click({ force: true });

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
