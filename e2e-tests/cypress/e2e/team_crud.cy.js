const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;

describe("Create and edit team", () => {
  before(() => {
    cy.createOrganizationAPI(parentOrg);
  });
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Should create and edit team", () => {
    cy.visit("/dashboard/teams/new");
    cy.get("input[name=title]").type(org);
    cy.get("input[name=name]").should("have.value", org);
    cy.get("textarea[name=description]").type("Test description");
    cy.get("button[aria-haspopup=listbox]").contains('span', 'Select a parent').click();
    cy.contains('[role="option"]', parentOrg).click();
    cy.get("button[type=submit]").click();
    cy.contains(`Successfully created the ${org} Team`, { timeout: 60000 });

    cy.visit(`/dashboard/teams/${org}/edit`);
    cy.get("input[name=title]").should("have.value", org);
    cy.get("input[name=title]").clear().type(org + " edited");
    cy.get("button[type=submit]").click();
    cy.contains(`Successfully edited the ${org} edited Team`, {
      timeout: 60000,
    });

    cy.visit(`/dashboard/teams/${org}/edit`);
    cy.get("input[name=title]", { timeout: 60000 }).should(
      "have.value",
      org + " edited",
    );
  });

  after(() => {
    cy.deleteOrganizationAPI(parentOrg);
    cy.deleteOrganizationAPI(org);
  });
});
