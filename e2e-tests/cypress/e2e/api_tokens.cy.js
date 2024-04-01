const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const teamOne = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const adminUser = `${uuid()}${Cypress.env("USER_NAME_SUFFIX")}_admin`;
const adminUserPassword = "test1234";
const adminUserEmail = Math.random().toString(36).slice(2) + "@test.com";

describe("Can add and remove members from teams and topics", () => {
  before(() => {
    cy.createOrganizationAPI(teamOne);
    cy.createUserApi(adminUser, adminUserEmail, adminUserPassword);
    cy.createOrganizationMemberAPI(teamOne, adminUser, "admin");
  });
  beforeEach(function () {
    cy.login(adminUser, adminUserPassword);
  });

  it("Create API Token", () => {
    cy.visit(`/dashboard/settings/edit/${adminUser}`);
    cy.contains("API Tokens").click();
    cy.contains("Create API Token").click();
    cy.get('#name').type("test-token");
    cy.contains("Create Token").click();
    cy.get("#copyButton").click()
    cy.contains("Copied text to clipboard")
  });

  it("List api keys", () => {
    cy.visit(`/dashboard/settings/edit/${adminUser}`);
    cy.contains("API Tokens").click();
    cy.contains("test-token")
  });

  it("Delete api keys", () => {
    cy.visit(`/dashboard/settings/edit/${adminUser}`);
    cy.contains("API Tokens").click();
    cy.contains("test-token")
    cy.get('.delete-token').eq(0).click()
    cy.contains('Delete Token').click()
    cy.get('.delete-token').should('have.length', 1)
  });

  after(() => {
    cy.deleteOrganizationAPI(teamOne);
    cy.deleteUserApi(adminUser);
  });
});
