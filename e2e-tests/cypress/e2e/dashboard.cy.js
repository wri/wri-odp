const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}${Cypress.env('DATASET_NAME_SUFFIX')}`;

describe("Dashboard Test", () => {
  before(() => {
    cy.createOrganizationAPI(parentOrg);
    cy.createDatasetAPI(parentOrg, datasetName, true)

  });
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Should check if activity stream contains dataset created", () => {
    cy.visit("/dashboard/");
    cy.get("#activities").should("exist");
    cy.get("#activities").contains(`${ckanUserName} created the package ${datasetName}`);
  });

  it("Should test dataset page", () => {
    cy.visit("/dashboard/datasets")
    cy.get('#alldataset').should('exist');
    cy.get('#alldataset').find('div').should('have.length.greaterThan', 0);

    cy.get('input[type="search"]').type(datasetName).type('{enter}');

    cy.contains('div', datasetName).should('exist');
    cy.get('button#rowshow').first().click();
    cy.contains(parentOrg)
  })

  it("Should test activity stream", () => {
    cy.visit('/dashboard/activity-stream')
    cy.contains(`${ckanUserName} created the package ${datasetName}`);
    cy.get('[id^="headlessui-listbox-button"]').click();
    cy.contains('[role="option"]', 'new').click();
    cy.contains(`${ckanUserName} created the package ${datasetName}`);
  })

  it("Should test Users page", () => {
    cy.visit("/dashboard/users")
    cy.contains(ckanUserName)
    cy.get('input[type="search"]').type(ckanUserName).type('{enter}');
    cy.contains(ckanUserName)
    cy.get('button#rowshow').first().click();
    cy.contains(("admin"))

  })
  it("Should test teams page", () => {
    cy.visit("dashboard/teams")
    cy.get('input[type="search"]').type(parentOrg).type('{enter}');
    cy.contains(parentOrg)
  })

  after(() => {
    cy.deleteDatasetAPI(datasetName)
    cy.deleteOrganizationAPI(parentOrg);
  });
});
