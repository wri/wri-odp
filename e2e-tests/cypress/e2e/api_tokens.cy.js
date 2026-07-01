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
    cy.contains("API Tokens", { timeout: 20000 }).click();
    cy.contains("Create API Token", { timeout: 20000 }).click();
    cy.get("#name", { timeout: 10000 })
      .should("be.visible")
      .clear()
      .type(tokenName);
    cy.contains("Create Token", { timeout: 10000 }).click();
    // After successful creation the modal closes (setOpen(false) in onSuccess)
    cy.get("#name", { timeout: 30000 }).should("not.exist");
  });

  it("List api keys", () => {
    cy.visit(`/dashboard/settings/edit/${adminUser}`);
    cy.contains("API Tokens", { timeout: 20000 }).click();
    cy.contains(tokenName, { timeout: 20000 }).should("be.visible");
  });

  it("Delete api keys", () => {
    cy.visit(`/dashboard/settings/edit/${adminUser}`);
    cy.contains("API Tokens", { timeout: 20000 }).click();
    cy.contains(tokenName, { timeout: 20000 }).should("be.visible");
    cy.get(".delete-token", { timeout: 20000 })
      .should("have.length.greaterThan", 0)
      .first()
      .click();
    cy.contains("Delete Token", { timeout: 10000 }).click();
    cy.contains(tokenName, { timeout: 30000 }).should("not.exist");
  });

  after(() => {
    cy.deleteOrganizationAPI(teamOne);
    cy.deleteUserApi(adminUser);
  });
});
