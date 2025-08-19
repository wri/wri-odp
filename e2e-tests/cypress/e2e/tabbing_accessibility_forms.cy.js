import "cypress-plugin-tab";
import "cypress-real-events/support";

const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const org = `${uuid().toString()}${orgSuffix}`;
const dataset = `${uuid()}${datasetSuffix}`;
const datasetName = `Test dataset title ${dataset}`;

describe("Create dataset via tabbing", () => {
  before(() => {
    cy.createOrganizationAPI(org);
  });

  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Should tab through the create dataset form without validation errors", () => {
    cy.visit("/dashboard/datasets/new");
    cy.get("input[name=title]")
      .click()
      .realPress([...datasetName]);
    cy.tab().realPress([...dataset]);
    cy.tabTo({ selector: "#team" })
      .type(org)
      .realPress(["Enter"])
      .realPress([...org])
      .realPress(["Enter"]);
    cy.tabTo({ selector: "#topicsButton" })
      .tab()
      .realPress([..."https://example.com/technical-notes"]);
    cy.tabTo({ selector: "#visibility_type" })
      .realPress(["Enter"])
      .realPress([..."Public"])
      .realPress(["Enter"]);
    cy.tabTo({ numberOfTabs: 9 }).realPress([
      ..."Test dataset short description",
    ]);
    cy.tabTo({ numberOfTabs: 11 }).realPress(["Enter"]);
    cy.realPress([..."Test Author"]);
    cy.tabTo({ numberOfTabs: 4 }).realPress(["Enter"]);
    cy.realPress([..."Test Maintainer"])
      .tab()
      .realPress([..."test.maintainer@example.com"]);
    cy.tabTo({ numberOfTabs: 18 }).realPress(["Enter"]);
    cy.realPress(["Enter"]);
    cy.realPress(["Enter"]);
    cy.contains("Save as Draft").focus();
    cy.tabTo({ numberOfTabs: 3 }).realPress(["Enter"]);

    cy.contains(`Successfully created the "${datasetName}" Dataset`, {
      timeout: 20000,
    });
  });

  after(() => {
    cy.deleteDatasetAPI(dataset);
    cy.deleteOrganizationAPI(org);
  });
});
