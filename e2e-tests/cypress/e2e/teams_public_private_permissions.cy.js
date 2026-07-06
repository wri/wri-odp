const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const uuid = () => Math.random().toString(36).slice(2) + "-test";
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;
const normalUserEmail = Math.random().toString(36).slice(2) + "@test.com";
const normalUser = `${uuid()}${Cypress.env("USER_NAME_SUFFIX")}_member`;
const normalUserPassword = "test1234";
const adminUser = `${uuid()}${Cypress.env("USER_NAME_SUFFIX")}_admin`;
const adminUserEmail = Math.random().toString(36).slice(2) + "@test.com";
const adminUserPassword = "test1234";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`.toLowerCase();
Cypress.on("uncaught:exception", (err, runnable) => {
  console.log(err);
  return false;
});

describe("Create public Team", () => {
  before(() => {
    cy.createUserApi(normalUser, normalUserEmail, normalUserPassword);
    cy.createUserApi(adminUser, adminUserEmail, adminUserPassword);
    cy.createOrganizationAPI(parentOrg);
    cy.createOrganizationMemberAPI(parentOrg, normalUser, "editor");
    cy.createOrganizationMemberAPI(parentOrg, adminUser, "admin");
  });

  beforeEach(() => {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Sysadmin can change visibility", () => {
    cy.visit(`/dashboard/teams/${parentOrg}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", parentOrg);

      cy.get('#visibility').contains("Public").should("exist");

      cy.get("button#visibility").click();
      cy.contains('[role="option"]', "Private").click();
      cy.get("button[type=submit]").click();
      cy.contains(`Successfully edited the ${parentOrg} Team`);
    });

    cy.visit(`/dashboard/teams/${parentOrg}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", parentOrg);

      cy.get('#visibility').contains("Private").should("exist");

      cy.get("button#visibility").click();
      cy.contains('[role="option"]', "Public").click();
      cy.get("button[type=submit]").click();
      cy.contains(`Successfully edited the ${parentOrg} Team`);
    });
  });

  it("Normal user can't change visibility", () => {
    cy.logout();
    cy.login(normalUser, normalUserPassword);

    cy.visit(`/dashboard/teams/${parentOrg}/edit`);

    cy.get('#visibility').contains("Public").should("exist");

    cy.get("button#visibility").click();
    cy.contains('[role="option"]', "Private").click();
    cy.get("button[type=submit]").click();
    cy.contains("User does not have admin access to edit this Team").should(
      "exist"
    );
  });

  it("Admin can change visibility to private but not back to public", () => {
    cy.logout();
    cy.login(adminUser, adminUserPassword);

    cy.visit(`/dashboard/teams/${parentOrg}/edit`);

    cy.get('#visibility').contains("Public").should("exist");

    cy.get("button#visibility").click();
    cy.contains('[role="option"]', "Private").click();
    cy.get("button[type=submit]").click();
    cy.contains(`Successfully edited the ${parentOrg} Team`);

    cy.visit(`/dashboard/teams/${parentOrg}/edit`);

    cy.get('#visibility').contains("Private").should("exist");

    cy.get("button#visibility").click();
    cy.contains('[role="option"]', "Public").click();
    cy.get("button[type=submit]").click();
    cy.contains(
      "User is unauthorized to change visibility from private to public. Please contact a SysAdmin."
    ).should("exist");
  });

  after(() => {
    cy.deleteOrganizationAPI(parentOrg);
    cy.deleteUserApi(normalUser);
    cy.deleteUserApi(adminUser);
  });
});
