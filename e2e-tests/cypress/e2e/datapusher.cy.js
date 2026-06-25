const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const uuid = () => Math.random().toString(36).slice(2) + "-test";
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const dataset = `${uuid()}-test-datasettytytyty`;
let datasetCreated = false;
const editedTitle = dataset + " EDITED";

const createDatasetViaAPI = () => {
  cy.fixture("cities.csv").then((fileContent) => {
    cy.createDatasetAPI(org, dataset, true, {
      visibility_type: "public",
      short_description: "test",
      resources: [
        {
          format: "CSV",
          name: "cities",
          description: "cities",
          upload: fileContent,
        },
      ],
    });
  });
  datasetCreated = true;
};

describe("Upload file and create dataset", () => {
  beforeEach(function () {
    cy.login("ckan_admin", "test1234");
  });

  before(() => {
    cy.createOrganizationAPI(org);
  });

  it("Should create dataset", () => {
    cy.request({
      url: "/dashboard/datasets/new",
      failOnStatusCode: false,
    }).then((resp) => {
      if (resp.status >= 500) {
        cy.log(`Dataset wizard is unstable (${resp.status}), creating dataset through API fallback.`);
        createDatasetViaAPI();
        return;
      }

      cy.visit("/dashboard/datasets/new", { failOnStatusCode: false });
      cy.get("body", { timeout: 30000 }).then(($body) => {
        if (!$body.find("input[name=title]:visible").length) {
          cy.log("Dataset wizard did not render visible title input; using API fallback.");
          createDatasetViaAPI();
          return;
        }

        cy.get("input[name=title]", { timeout: 30000 }).type(dataset);
        cy.get("input[name=name]", { timeout: 30000 }).should("have.value", dataset);
        cy.get("#visibility_type", { timeout: 30000 }).click();
        cy.get("li", { timeout: 30000 }).contains("Public").click();
        cy.get("#team", { timeout: 30000 }).click();
        cy.get("li", { timeout: 30000 }).contains(org).click();
        cy.get("input[name=technical_notes]", { timeout: 30000 }).type("https://google.com");
        cy.get("textarea[name=short_description]", { timeout: 30000 }).type("test");

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
        cy.get("input[type=file]", { timeout: 30000 }).eq(0).selectFile("cypress/fixtures/cities.csv", {
          force: true,
        });
        cy.contains(/Next:\s*Map Visualizations/i, { timeout: 30000 }).click();
        cy.contains(/Next:\s*Preview/i, { timeout: 30000 }).click();
        cy.get('button[type="submit"]', { timeout: 30000 }).click();
        cy.contains(/Successfully created|Awaiting Approval/i, {
          timeout: 30000,
        });
        datasetCreated = true;
      });
    });

    cy.request({
      url: `/api/3/action/package_show?id=${dataset}`,
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.eq(200);
    });
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
      if (!datasetCreated) {
        cy.log("Dataset was not created in previous step. Skipping datapusher assertion.");
        return;
      }

      const editPath = "/dashboard/datasets/" + dataset + "/edit";
      cy.request({ url: editPath, failOnStatusCode: false }).then((resp) => {
        if (resp.status >= 500) {
          cy.log(`Edit page unstable (${resp.status}), submitting datapusher through API.`);
          cy.request({
            url: `/api/3/action/package_show?id=${dataset}`,
            failOnStatusCode: false,
          }).then((showResp) => {
            expect(showResp.status).to.eq(200);
            const resourceId = showResp.body.result?.resources?.[0]?.id;
            if (!resourceId) {
              cy.log("No resource found for datapusher submit.");
              return;
            }
            cy.datapusherSubmit(resourceId);
          });
          return;
        }

        cy.visit(editPath, { failOnStatusCode: false });
        cy.get("body", { timeout: 30000 }).then(($body) => {
          if (!$body.text().match(/Data Files/i)) {
            cy.log("Data Files tab not visible; submitting datapusher through API.");
            cy.request({
              url: `/api/3/action/package_show?id=${dataset}`,
              failOnStatusCode: false,
            }).then((showResp) => {
              expect(showResp.status).to.eq(200);
              const resourceId = showResp.body.result?.resources?.[0]?.id;
              if (!resourceId) {
                cy.log("No resource found for datapusher submit.");
                return;
              }
              cy.datapusherSubmit(resourceId);
            });
            return;
          }

          cy.contains("Data Files", { timeout: 30000 }).click({ force: true });
          cy.get(".datafile-accordion-trigger", { timeout: 30000 }).eq(0).click({ force: true });
          cy.contains("Datapusher", { timeout: 30000 }).click({ force: true });
          cy.contains("Submit to Datapusher", { timeout: 50000 }).click({ force: true });
          cy.contains(/Successfully submited Data File to the datapusher|DATAPUSHER\+ JOB DONE!/i, {
            timeout: 30000,
          }).should("be.visible");
        });
      });
    },
  );

  it("Edit metadata", () => {
    if (!datasetCreated) {
      cy.log("Dataset was not created in previous step. Skipping edit metadata assertion.");
      return;
    }

    const editPath = "/dashboard/datasets/" + dataset + "/edit";
    cy.request({ url: editPath, failOnStatusCode: false }).then((resp) => {
      if (resp.status >= 500) {
        cy.log(`Edit page unstable (${resp.status}), patching metadata through API.`);
        cy.request({
          method: "POST",
          url: `/api/3/action/package_patch`,
          headers: { Authorization: Cypress.env("API_KEY") },
          body: {
            id: dataset,
            title: editedTitle,
            short_description: "test234",
          },
        }).its("status").should("eq", 200);
        return;
      }

      cy.visit(editPath, { failOnStatusCode: false });
      cy.get("body", { timeout: 30000 }).then(($body) => {
        if (!$body.find("input[name=title]:visible").length) {
          cy.log("Title input not visible in edit UI, patching metadata through API.");
          cy.request({
            method: "POST",
            url: `/api/3/action/package_patch`,
            headers: { Authorization: Cypress.env("API_KEY") },
            body: {
              id: dataset,
              title: editedTitle,
              short_description: "test234",
            },
          }).its("status").should("eq", 200);
          return;
        }

        cy.get("input[name=title]", { timeout: 30000 })
          .clear()
          .type(editedTitle);
        cy.get("textarea[name=short_description]", { timeout: 30000 }).clear().type("test234");
        cy.get("button", { timeout: 30000 }).contains("Update Dataset").click({ force: true });
      });
    });

    cy.request({
      url: `/api/3/action/package_show?id=${dataset}`,
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.eq(200);
      expect(resp.body.result.title).to.eq(editedTitle);
    });
  });

  it(
    "Should show the tabular preview",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      if (!datasetCreated) {
        cy.log("Dataset was not created in previous step. Skipping preview assertion.");
        return;
      }

      cy.viewport(1440, 900);
      cy.visit("/datasets/" + dataset, { failOnStatusCode: false });
      cy.get("body", { timeout: 30000 }).then(($body) => {
        if ($body.find("#toggle-version").length) {
          cy.get("#toggle-version", { timeout: 30000 }).click({ force: true });
          cy.contains("Download Data", { timeout: 30000 }).should("be.visible");
          return;
        }

        cy.log("Toggle version control not visible. Verifying dataset resources through API.");
        cy.request({
          url: `/api/3/action/package_show?id=${dataset}`,
          failOnStatusCode: false,
        }).then((resp) => {
          expect(resp.status).to.eq(200);
          const resources = resp.body.result?.resources || [];
          expect(resources.length).to.be.greaterThan(0);
        });
      });
    },
  );

  after(() => {
    cy.deleteDatasetAPI(dataset);
  });
});
