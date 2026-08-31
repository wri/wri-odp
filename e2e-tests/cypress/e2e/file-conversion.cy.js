const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;

// TODO: this test is not robust enoguh
describe("Data Files", () => {
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  before(() => {
    cy.createOrganizationAPI(org);
  });

  it("Should create dataset", () => {
    cy.visit("/dashboard/datasets/new");
    cy.get("input[name=title]").type(datasetName);
    cy.get("input[name=name]").should("have.value", datasetName);
    cy.get("textarea[name=short_description]").type("test");
    cy.contains("Description")
      .parent()
      .parent()
      .find(".tiptap.ProseMirror")
      .type("RICH TEXT EDITOR");

    cy.get("#team").click();
    cy.get('[role="listbox"]').should("be.visible");
    cy.contains('[role="option"]', org).click();
    cy.get("#team").should("contain.text", org.charAt(0).toUpperCase() + org.slice(1));

    cy.get("#visibility_type").click();
    cy.contains('[role="option"]', "Public").click();
    cy.contains("Methodology").click();
    cy.get("input[name=technical_notes]").type("https://google.com");

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
    cy.contains("Add another Data File", { timeout: 15000 }).should("be.visible");
    cy.get(".datafile-accordion-trigger", { timeout: 15000 }).eq(0).click();
    cy.get("input[type=file]")
      .eq(0)
      .selectFile("cypress/fixtures/airtravel.csv", {
        force: true,
      });
    cy.wait(5000);
    cy.contains("Next: Map Visualizations").click();
    cy.contains("Next: Preview").click();
    cy.get('button[type="submit"]').click();
    cy.contains("Successfully created", {
      timeout: 20000,
    });
  });

  it(
    "Submit datapusher",
    {
      retries: {
        runMode: 3,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/dashboard/datasets/" + datasetName + "/edit");
      cy.contains("Data Files", { timeout: 20000 }).click();
      cy.get(".datafile-accordion-trigger").eq(0).click();
      cy.contains("Datapusher").click();
      cy.get("body").then(($body) => {
        if ($body.text().includes("DATAPUSHER+ JOB DONE!")) {
          return;
        }
        cy.contains("Submit to Datapusher", { timeout: 50000 }).click();
        cy.contains(`Successfully submited Data File to the datapusher`, {
          timeout: 15000,
        });
      });
      cy.contains("DATAPUSHER+ JOB DONE!", { timeout: 120000 });
    },
  );

  after(() => {
    cy.request({
      method: "POST",
      url: `${Cypress.config().apiUrl}/api/3/action/package_delete`,
      headers: { Authorization: Cypress.env("API_KEY") },
      failOnStatusCode: false,
      body: {
        id: datasetName,
      },
    });
  });
});
