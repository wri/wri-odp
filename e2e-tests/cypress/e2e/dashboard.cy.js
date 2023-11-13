const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}${Cypress.env('DATASET_NAME_SUFFIX')}`;

const parentOrg2 = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org2 = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName2 = `${uuid()}${Cypress.env('DATASET_NAME_SUFFIX')}`;

const group = `${uuid()}${Cypress.env("GROUP_SUFFIX")}`;
const user = `${uuid()}-user`;
const email = `${uuid()}@gmail.com`;

describe("Dashboard Test", () => {
  before(() => {
    cy.createOrganizationAPI(parentOrg);
    cy.createDatasetAPI(parentOrg, datasetName, true)

    cy.createOrganizationAPI(parentOrg2);
    cy.createDatasetAPI(parentOrg2, datasetName2, true)

    cy.createGroupAPI(group)
    cy.createUserApi(user, email, 'test1234')

  });
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  // it("Should check if activity stream contains dataset created", () => {
  //   cy.visit("/dashboard/");
  //   cy.get("#activities").should("exist");
  //   cy.get("#activities").contains(`${ckanUserName} created the package ${datasetName}`);
  // });

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
    cy.get('[id^="headlessui-listbox-button"]').first().click();;
    cy.contains('[role="option"]', 'new').click();
    cy.contains(`${ckanUserName} created the package ${datasetName}`);
  })

  it("Should test Users page", () => {
    cy.visit("/dashboard/users")
    cy.contains(user)
    cy.get('input[type="search"]').type(user).type('{enter}');
    cy.contains(user)

  })
  it("Should test teams page", () => {
    cy.visit("dashboard/teams")
    cy.get('input[type="search"]').type(parentOrg).type('{enter}');
    cy.contains(parentOrg)
  })

  it("should delete dataset", () => {
    cy.visit("/dashboard/datasets")
    cy.get('input[type="search"]').type(datasetName2).type('{enter}');
    cy.contains(datasetName2).should('exist');
    cy.get(`button#delete-tooltip-${datasetName2}`).first().click({ force: true });
    cy.get(`button#${datasetName2}`).click();
    cy.contains('Dataset delete is successful')

  })
  it("should delete Team", () => {
    cy.visit("/dashboard/teams")
    cy.get('input[type="search"]').type(parentOrg2).type('{enter}');
    cy.contains(parentOrg2).should('exist');
    cy.get(`button#delete-tooltip-${parentOrg2}`).first().click({ force: true });
    cy.get(`button#${parentOrg2}`).click();
    cy.contains('Team delete is successful')
  })

  it("should delete topic", () => {
    cy.visit("/dashboard/topics")
    cy.get('input[type="search"]').type(group).type('{enter}');
    cy.contains(group).should('exist');
    cy.get(`button#delete-tooltip-${group}`).first().click({ force: true });
    cy.get(`button#${group}`).click();
    cy.contains('Topic delete is successful')
  })

  after(() => {
    cy.deleteDatasetAPI(datasetName)
    cy.deleteOrganizationAPI(parentOrg);
  });
});
