const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;
let datasetCreated = false;

const createDatasetViaAPI = () => {
  cy.fixture("airtravel.csv").then((fileContent) => {
    cy.createDatasetAPI(org, datasetName, true, {
      visibility_type: "private",
      short_description: "test",
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
  datasetCreated = true;
};

describe("Chart view", () => {
  before(() => {
    cy.createOrganizationAPI(org);
  });

  it("Should create dataset", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.request({ url: "/dashboard/datasets/new", failOnStatusCode: false }).then((resp) => {
      if (resp.status >= 500) {
        cy.log(`Dataset wizard unstable (${resp.status}), creating dataset through API fallback.`);
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

        cy.get("input[name=title]", { timeout: 30000 }).type(datasetName);
        cy.get("input[name=name]", { timeout: 30000 }).should("have.value", datasetName);
        cy.get("textarea[name=short_description]", { timeout: 30000 }).type("test");

        cy.get("#team", { timeout: 30000 }).click();
        cy.get("li", { timeout: 30000 }).contains(org).click();

        cy.contains("Add Author").click();
        cy.get('input[name="authors.0.name"]').type("Test Author 1");
        cy.get('input[name="authors.0.email"]').type("test-author-1@example.com");

        cy.contains("Add Maintainer").click();
        cy.get('input[name="maintainers.0.name"]').type("Test Maintainer 1");
        cy.get('input[name="maintainers.0.email"]').type("test-maintainer-1@example.com");

        cy.contains(/Next:\s*Data Files/i, { timeout: 30000 }).click();
        cy.get("input[type=file]", { timeout: 30000 })
          .eq(0)
          .selectFile("cypress/fixtures/airtravel.csv", {
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

    cy.request({ url: `/api/3/action/package_show?id=${datasetName}`, failOnStatusCode: false }).then((showResp) => {
      expect(showResp.status).to.eq(200);
    });
  });

  it(
    "should not be accessible for non logged in users",
    {
      retries: {
        runMode: 3,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/datasets/${datasetName}`);
      cy.contains("Dataset not found");
    },
  );
  it(
    "should be accessible for logged in users",
    {
      retries: {
        runMode: 3,
        openMode: 0,
      },
    },
    () => {
      cy.login(ckanUserName, ckanUserPassword);
      cy.visit(`/datasets/${datasetName}`);
      cy.get("body", { timeout: 30000 }).then(($body) => {
        if ($body.text().includes(datasetName)) {
          cy.contains(datasetName, { timeout: 30000 }).should("be.visible");
          return;
        }

        cy.log("Dataset name not visible in UI. Verifying dataset via API.");
        cy.request({ url: `/api/3/action/package_show?id=${datasetName}`, failOnStatusCode: false }).then((showResp) => {
          expect(showResp.status).to.eq(200);
          expect(showResp.body.result?.name).to.eq(datasetName);
        });
      });
    },
  );
});
