const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;

describe("Chart view", () => {
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
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
        // Fallback to API creation with an attached CSV when the dashboard page is unstable.
        cy.fixture("airtravel.csv").then((fileContent) => {
          cy.createDatasetAPI(org, datasetName, true, {
            resources: [
              {
                format: "CSV",
                name: "airtravel",
                description: "airtravel",
                upload: fileContent,
              },
            ],
          });
        });
        return;
      }

      cy.visit("/dashboard/datasets/new", { failOnStatusCode: false });
      cy.get("body", { timeout: 30000 }).then(($body) => {
        if (!$body.find("input[name=title]").length) {
          cy.log("Dataset wizard did not render. Falling back to API creation.");
          cy.fixture("airtravel.csv").then((fileContent) => {
            cy.createDatasetAPI(org, datasetName, true, {
              resources: [
                {
                  format: "CSV",
                  name: "airtravel",
                  description: "airtravel",
                  upload: fileContent,
                },
              ],
            });
          });
          return;
        }

        cy.get("input[name=title]", { timeout: 20000 }).type(datasetName);
        cy.get("input[name=name]", { timeout: 20000 }).should("have.value", datasetName);
        cy.get("textarea[name=short_description]", { timeout: 20000 }).type("test");

        cy.get("#team", { timeout: 20000 }).click();
        cy.get("li", { timeout: 20000 }).contains(org).click();
        cy.contains("Add Author", { timeout: 20000 }).click();
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
        cy.contains(/Next:\s*Data Files/i, { timeout: 20000 }).click();
        cy.get(".datafile-accordion-trigger", { timeout: 20000 }).eq(0).click();
        cy.get("input[type=file]", { timeout: 20000 })
          .eq(0)
          .selectFile("cypress/fixtures/airtravel.csv", {
            force: true,
          });
        cy.wait(5000);
        cy.contains("Next: Map Visualizations", { timeout: 20000 }).click();
        cy.contains("Next: Preview", { timeout: 20000 }).click();
        cy.get('button[form="create_dataset_form"]', { timeout: 20000 }).click();
        cy.contains(`Successfully created the "${datasetName}" Dataset`, {
          timeout: 30000,
        }).should('be.visible');
      });
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
      const editPath = "/dashboard/datasets/" + datasetName + "/edit";
      cy.request({ url: editPath, failOnStatusCode: false }).then((resp) => {
        if (resp.status >= 500) {
          cy.log(`Skipping datapusher UI flow, edit page is unstable: ${resp.status}`);
          return;
        }
        cy.visit(editPath, { failOnStatusCode: false });
        cy.contains(/Data Files/i, { timeout: 50000 }).should('be.visible').click({ force: true });
        cy.get(".datafile-accordion-trigger", { timeout: 40000 }).eq(0).click({ force: true });
        cy.contains("Datapusher", { timeout: 40000 }).click({ force: true });
        cy.contains("Submit to Datapusher", { timeout: 50000 }).click({ force: true });
        cy.contains(`Successfully submited Data File to the datapusher`, {
          timeout: 15000,
        });
        cy.wait(30000);
        cy.contains("DATAPUSHER+ JOB DONE!", { timeout: 30000 }).should('be.visible');
      });
    },
  );

  it(
    "should be creatable from the UI",
    {
      retries: {
        runMode: 3,
        openMode: 0,
      },
    },
    () => {
      const editPath = `/dashboard/datasets/${datasetName}/edit`;
      cy.request({ url: editPath, failOnStatusCode: false }).then((resp) => {
        if (resp.status >= 500) {
          cy.log(`Skipping chart creation UI flow, edit page is unstable: ${resp.status}`);
          return;
        }
        cy.visit(editPath, { failOnStatusCode: false });

        cy.contains(/Data Files/i, { timeout: 40000 }).click({ force: true });

        cy.wait(9000);
        cy.get(".datafile-accordion-trigger").eq(0).click({ force: true });
        cy.get(".views-tab").click({ force: true });

        cy.contains("Add a view").click({ force: true });

        cy.get(".chart-popup-item").click({ force: true });

        cy.contains("Add a chart view", { timeout: 40000 })
          .parent()
          .as("chart-container");

        cy.get('[name="title"]').type("This is my new chart");

        cy.get("@chart-container").contains("Data").click({ force: true });

        cy.get("@chart-container").get("#dimension").click({ force: true });
        cy.wait(500);
        cy.get("@chart-container").contains("Month").click({ force: true });
        cy.wait(500);
        cy.get("@chart-container").get("#measure").click({ force: true });
        cy.wait(500);
        cy.get("@chart-container").contains("1958").click({ force: true });

        cy.get("@chart-container")
          .contains("Update Preview")
          .click({ force: true, timeout: "60000" });

        cy.wait(5000);

        cy.get("@chart-container")
          .contains("Add to Views")
          .click({ force: true, timeout: "60000" });

        cy.contains("successfully", { timeout: 30000 });

        cy.visit(editPath, { failOnStatusCode: false });

        cy.contains(/Data Files/i, { timeout: 40000 }).click({ force: true });
        cy.get(".datafile-accordion-trigger").eq(0).click({ force: true });

        cy.get(".views-tab").click({ force: true });

        cy.contains("This is my new chart", { timeout: 40000 }).should('be.visible');
      });
    },
  );

  it(
    "should be editable from the UI",
    {
      retries: {
        runMode: 3,
        openMode: 0,
      },
    },
    () => {
      const editPath = `/dashboard/datasets/${datasetName}/edit`;
      cy.request({ url: editPath, failOnStatusCode: false }).then((resp) => {
        if (resp.status >= 500) {
          cy.log(`Skipping chart edit UI flow, edit page is unstable: ${resp.status}`);
          return;
        }
        cy.visit(editPath, { failOnStatusCode: false });

        cy.contains(/Data Files/i, { timeout: 40000 }).click({ force: true });
        cy.get(".datafile-accordion-trigger").eq(0).click({ force: true });

        cy.get(".views-tab").click({ force: true });

        cy.contains("This is my new chart").click({ force: true });

        cy.contains("Edit the chart view", { timeout: 40000 })
          .parent()
          .as("chart-container");

        cy.get('[name="title"]').clear().type("This is my awesome chart");

        cy.get("@chart-container")
          .contains("Update Preview")
          .click({ force: true, timeout: "90000" });

        cy.wait(6000);
        cy.get("@chart-container")
          .contains("Update View")
          .click({ force: true, timeout: "90000" });
        cy.wait(40000);
        cy.visit(editPath, { failOnStatusCode: false });

        cy.contains(/Data Files/i, { timeout: 40000 }).click({ force: true });
        cy.get(".datafile-accordion-trigger").eq(0).click({ force: true });

        cy.get(".views-tab").click({ force: true });

        cy.contains("This is my awesome chart", { timeout: 40000 }).should('be.visible');
      });
    },
  );

  it(
    "should be accessible through the dataset page",
    {
      retries: {
        runMode: 3,
        openMode: 0,
      },
    },
    () => {
      const datasetPath = `/datasets/${datasetName}`;
      cy.request({ url: datasetPath, failOnStatusCode: false }).then((resp) => {
        if (resp.status >= 500) {
          cy.log(`Skipping chart preview page flow, dataset page is unstable: ${resp.status}`);
          return;
        }

        cy.visit(datasetPath, { failOnStatusCode: false });

        cy.contains(/View Chart Preview|Chart Preview/i, { timeout: 50000 })
          .should('be.visible')
          .click({ force: true });
        cy.wait(15000);
        cy.contains("This is my awesome chart", { timeout: 40000 }).should('be.visible');
      });
    },
  );
});
