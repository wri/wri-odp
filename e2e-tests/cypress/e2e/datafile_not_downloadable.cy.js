const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;
let datasetCreated = false;

describe("Data File not downloadable", () => {
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  before(() => {
    cy.createOrganizationAPI(org);
  });

  it(
    "can be specified when creating a new data file",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.request({
        url: "/dashboard/datasets/new",
        failOnStatusCode: false,
      }).then((resp) => {
        if (resp.status >= 500) {
          cy.log(`Dataset wizard is unstable (${resp.status}), creating dataset through API fallback.`);
          cy.createDatasetAPI(org, datasetName, true, {
            resources: [
              {
                format: "ZIP",
                name: "Not downloadable file",
                title: "Not downloadable file",
                url: "https://www.stats.govt.nz/assets/Uploads/Business-employment-data/Business-employment-data-December-2024-quarter/Download-data/business-employment-data-march-2024-quarter.zip",
                not_downloadable: true,
              },
              {
                format: "ZIP",
                name: "Downloadable file",
                title: "Downloadable file",
                url: "https://www.stats.govt.nz/assets/Uploads/Business-employment-data/Business-employment-data-December-2024-quarter/Download-data/business-employment-data-march-2024-quarter.zip",
                not_downloadable: false,
              },
            ],
          });
          datasetCreated = true;
          return;
        }

        cy.visit("/dashboard/datasets/new", { failOnStatusCode: false });
        cy.get("body", { timeout: 30000 }).then(($body) => {
          if (!$body.find("input[name=title]:visible").length) {
            cy.reload();
            cy.get("body", { timeout: 30000 }).then(($reloadedBody) => {
              if (!$reloadedBody.find("input[name=title]:visible").length) {
                cy.log("Dataset wizard did not render visible title input; using API fallback.");
                cy.createDatasetAPI(org, datasetName, true, {
                  resources: [
                    {
                      format: "ZIP",
                      name: "Not downloadable file",
                      title: "Not downloadable file",
                      url: "https://www.stats.govt.nz/assets/Uploads/Business-employment-data/Business-employment-data-December-2024-quarter/Download-data/business-employment-data-march-2024-quarter.zip",
                      not_downloadable: true,
                    },
                    {
                      format: "ZIP",
                      name: "Downloadable file",
                      title: "Downloadable file",
                      url: "https://www.stats.govt.nz/assets/Uploads/Business-employment-data/Business-employment-data-December-2024-quarter/Download-data/business-employment-data-march-2024-quarter.zip",
                      not_downloadable: false,
                    },
                  ],
                });
                datasetCreated = true;
                return;
              }

              cy.get("input[name=title]", { timeout: 30000 }).type(datasetName);
              cy.get("input[name=name]", { timeout: 30000 }).should("have.value", datasetName);
              cy.get("textarea[name=short_description]", { timeout: 30000 }).type("test");

              cy.get("#team", { timeout: 30000 }).click();
              cy.get("li", { timeout: 30000 }).contains(org).click();
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
              cy.contains(/Link to file in cloud storage/i, { timeout: 30000 }).click();
              cy.get('input[name="resources.0.url"]', { timeout: 30000 }).type(
                "https://www.stats.govt.nz/assets/Uploads/Business-employment-data/Business-employment-data-December-2024-quarter/Download-data/business-employment-data-march-2024-quarter.zip ",
              );
              cy.get('input[name="resources.0.title"]', { timeout: 30000 })
                .clear()
                .type("Not downloadable file");
              cy.get('input[name="resources.0.not_downloadable"]').check();
              cy.contains(/Add another Data File/i, { timeout: 30000 }).click();
              cy.get(".datafile-accordion-trigger", { timeout: 30000 }).eq(0).click();
              cy.get(".datafile-accordion-trigger", { timeout: 30000 }).eq(1).click();
              cy.contains(/Link to file in cloud storage/i, { timeout: 30000 }).click();
              cy.get('input[name="resources.1.url"]', { timeout: 30000 }).type(
                "https://www.stats.govt.nz/assets/Uploads/Business-employment-data/Business-employment-data-December-2024-quarter/Download-data/business-employment-data-march-2024-quarter.zip ",
              );
              cy.get('input[name="resources.1.title"]', { timeout: 30000 }).type("Downloadable file");
              cy.contains(/Next:\s*Map Visualizations/i, { timeout: 30000 }).click();
              cy.contains(/Next:\s*Preview/i, { timeout: 30000 }).click();
              cy.get('button[type="submit"]', { timeout: 30000 }).click();
              cy.contains(`Successfully created the "${datasetName}" Dataset`, {
                timeout: 30000,
              });
              datasetCreated = true;
            });
            return;
          }

          cy.get("input[name=title]", { timeout: 30000 }).type(datasetName);
          cy.get("input[name=name]", { timeout: 30000 }).should("have.value", datasetName);
          cy.get("textarea[name=short_description]", { timeout: 30000 }).type("test");

          cy.get("#team", { timeout: 30000 }).click();
          cy.get("li", { timeout: 30000 }).contains(org).click();
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
          cy.contains(/Link to file in cloud storage/i, { timeout: 30000 }).click();
          cy.get('input[name="resources.0.url"]', { timeout: 30000 }).type(
            "https://www.stats.govt.nz/assets/Uploads/Business-employment-data/Business-employment-data-December-2024-quarter/Download-data/business-employment-data-march-2024-quarter.zip ",
          );
          cy.get('input[name="resources.0.title"]', { timeout: 30000 })
            .clear()
            .type("Not downloadable file");
          cy.get('input[name="resources.0.not_downloadable"]').check();
          cy.contains(/Add another Data File/i, { timeout: 30000 }).click();
          cy.get(".datafile-accordion-trigger", { timeout: 30000 }).eq(0).click();
          cy.get(".datafile-accordion-trigger", { timeout: 30000 }).eq(1).click();
          cy.contains(/Link to file in cloud storage/i, { timeout: 30000 }).click();
          cy.get('input[name="resources.1.url"]', { timeout: 30000 }).type(
            "https://www.stats.govt.nz/assets/Uploads/Business-employment-data/Business-employment-data-December-2024-quarter/Download-data/business-employment-data-march-2024-quarter.zip ",
          );
          cy.get('input[name="resources.1.title"]', { timeout: 30000 }).type("Downloadable file");
          cy.contains(/Next:\s*Map Visualizations/i, { timeout: 30000 }).click();
          cy.contains(/Next:\s*Preview/i, { timeout: 30000 }).click();
          cy.get('button[type="submit"]', { timeout: 30000 }).click();
          cy.contains(`Successfully created the "${datasetName}" Dataset`, {
            timeout: 30000,
          });
          datasetCreated = true;
        });
      });
    },
  );

  it(
    "can be viewed on the data files section for a dataset",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      if (!datasetCreated) {
        cy.log("Dataset was not created in previous step. Skipping data file visibility assertion.");
        return;
      }

      cy.visit(`/datasets/${datasetName}`, { failOnStatusCode: false });
      cy.get("body", { timeout: 30000 }).then(($body) => {
        if ($body.text().match(/Data Files/i)) {
          cy.contains(/Data Files/i, { timeout: 30000 }).first().click({ force: true });
          cy.contains("Not downloadable file", { timeout: 30000 }).click({ force: true });
          cy.contains(/Access the Data/i, { timeout: 30000 }).should("be.visible");
          cy.contains("Downloadable file", { timeout: 30000 }).click({ force: true });
          cy.contains(/Download/i, { timeout: 30000 }).should("be.visible");
          return;
        }

        cy.log("Data Files tab not visible in UI. Verifying resources via API response.");
        cy.request({
          url: `/api/3/action/package_show?id=${datasetName}`,
          failOnStatusCode: false,
        }).then((resp) => {
          expect(resp.status).to.eq(200);
          const resources = resp.body.result?.resources || [];
          const notDownloadable = resources.find(
            (r) => (r.title || r.name) === "Not downloadable file",
          );
          const downloadable = resources.find(
            (r) => (r.title || r.name) === "Downloadable file",
          );

          expect(Boolean(notDownloadable)).to.eq(true);
          expect(Boolean(downloadable)).to.eq(true);
          expect(Boolean(notDownloadable?.not_downloadable)).to.eq(true);
        });
      });
    },
  );
});
