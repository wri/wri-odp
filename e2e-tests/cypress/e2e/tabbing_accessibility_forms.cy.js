import "cypress-plugin-tab";
import "cypress-real-events/support";

const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const org = `${uuid().toString()}${orgSuffix}`;
const dataset = `${uuid()}${datasetSuffix}`;
const datasetTitle = `Test dataset title ${dataset}`;

describe("Create dataset via tabbing", () => {
  before(() => {
    cy.createOrganizationAPI(org);
  });

  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  // This test is a bit fragile due to so many tabs, differences between
  // headless electron (even with the same version locally and in CI), etc.
  // Any slight change to the form can break it.
  it("Should tab through the create dataset form without validation errors", () => {
    cy.visit("/dashboard/datasets/new");

    // Title
    cy.get("input[name=title]")
      .click()
      .realPress([...datasetTitle]);

    // Dataset Name/Slug
    cy.tab().realPress([...dataset]);

    // Team
    cy.tabTo({ selector: "#team", timeout: 10000 })
      .should("be.visible")
      .should("be.focused")
      .realPress(["ArrowDown"]);
    cy.realPress([...org]);
    cy.realPress(["Enter"]);
    cy.get("#team").should("contain.text", org.charAt(0).toUpperCase() + org.slice(1));

    // Visibility
    cy.tabTo({ selector: "#visibility_type" })
      .realPress(["ArrowDown"])
      .realPress(["ArrowDown"])
      .realPress(["Enter"]);

    // Ensure visibility dropdown is closed (seems to inconsistently close automatically)
    cy.get("[id^=headlessui-listbox-options-]").should("not.exist");

    // Required fields in current metadata layout
    cy.get("textarea[name=short_description]").type("Test dataset short description");
    cy.contains("Description")
      .parent()
      .parent()
      .find(".tiptap.ProseMirror")
      .type("RICH TEXT EDITOR");
    cy.contains("Methodology").click();
    cy.get("input[name=technical_notes]").type("https://example.com/technical-notes");

    cy.contains("Add data maintainer").click();
    cy.get('input[name="maintainers.0.name"]').type("Test Maintainer");
    cy.get('input[name="maintainers.0.email"]').type("test.maintainer@example.com");

    cy.contains("Next: Data Files").click();
    cy.contains("Add another Data File", { timeout: 15000 }).should("be.visible");
    cy.get(".datafile-accordion-trigger", { timeout: 15000 }).eq(0).click();
    cy.get("input[type=file]")
      .eq(0)
      .selectFile("cypress/fixtures/airtravel.csv", {
        force: true,
      });
    cy.contains("airtravel.csv", { timeout: 30000 }).should("be.visible");
    cy.contains("Next: Map Visualizations").click();
    cy.contains("Next: Preview").click();
    cy.get('button[form="create_dataset_form"]').click();

    cy.contains(`Successfully created the "${datasetTitle}" Dataset`, {
      timeout: 20000,
    });
  });

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
