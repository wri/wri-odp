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

    // Topics
    cy.tabTo({ selector: "#topicsButton" })
      .tab()
      .realPress([..."https://example.com/technical-notes"]);

    // Visibility
    cy.tabTo({ selector: "#visibility_type" })
      .realPress(["ArrowDown"])
      .realPress(["ArrowDown"])
      .realPress(["Enter"]);

    // Ensure visibility dropdown is closed (seems to inconsistently close automatically)
    cy.get("[id^=headlessui-listbox-options-]").should("not.exist");

    // Short description
    cy.tabTo({ numberOfTabs: 7 }).realPress([
      ..."Test dataset short description",
    ]);

    // Author
    cy.tabTo({ numberOfTabs: 11 }).realPress(["Enter"]);
    cy.realPress([..."Test Author"]);

    // Maintainer
    cy.tabTo({ numberOfTabs: 4 }).realPress(["Enter"]);
    cy.realPress([..."Test Maintainer"])
      .tab()
      .realPress([..."test.maintainer@example.com"]);

    // Go to end of form and skip resources
    cy.tabTo({ numberOfTabs: 18 }).realPress(["Enter"]);
    cy.realPress(["Enter"]);
    cy.realPress(["Enter"]);

    // Submit/Save
    cy.contains("Save as Draft").focus();
    cy.tabTo({ numberOfTabs: 3 }).realPress(["Enter"]);

    cy.contains(`Successfully created the "${datasetTitle}" Dataset`, {
      timeout: 20000,
    });
  });

  after(() => {
    cy.deleteDatasetAPI(dataset);
    cy.deleteOrganizationAPI(org);
  });
});
