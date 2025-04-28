const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const uuid = () => Math.random().toString(36).slice(2) + "-test";
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;
const normalUserEmail = Math.random().toString(36).slice(2) + "@test.com";
const normalUser = `${uuid()}${Cypress.env("USER_NAME_SUFFIX")}_member`;
const normalUserPassword = "test1234";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`.toLowerCase();
Cypress.on("uncaught:exception", (err, runnable) => {
  console.log(err);
  return false;
});

describe("Create public Team", () => {
  before(() => {
    cy.createUserApi(normalUser, normalUserEmail, normalUserPassword);
    cy.createOrganizationAPI(parentOrg);
    cy.createOrganizationMemberAPI(parentOrg, normalUser, "admin");
  });

  beforeEach(() => {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Sysadmin can change visibility", () => {
    cy.visit(`/dashboard/teams/${parentOrg}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", parentOrg);

      cy.get("span.block").contains("Public").should("exist");

      cy.get("button#visibility").click();
      cy.get("li").contains("Private").click();
      cy.get("button[type=submit]").click();
      cy.contains(`Successfully edited the ${parentOrg} team`);
    });

    cy.visit(`/dashboard/teams/${parentOrg}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", parentOrg);

      cy.get("span.block").contains("Private").should("exist");

      cy.get("button#visibility").click();
      cy.get("li").contains("Public").click();
      cy.get("button[type=submit]").click();
      cy.contains(`Successfully edited the ${parentOrg} team`);
    });
  });

  it("Normal user can change visibility to private", () => {
    cy.logout();
    cy.login(normalUser, normalUserPassword);

    cy.visit(`/dashboard/teams/${parentOrg}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", parentOrg);
      cy.get("span.block").contains("Public").should("exist");

      cy.get("button#visibility").click();
      cy.get("li").contains("Private").click();
    });
    cy.get("button[type=submit]").click();

    cy.contains(`Successfully edited the ${parentOrg} team`);

    cy.visit(`/dashboard/teams/${parentOrg}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", parentOrg);
      cy.get("span.block").contains("Private").should("exist");
      cy.get("button#visibility").should("be.disabled");

      cy.get("button[type=submit]").click();
      cy.contains(`Successfully edited the ${parentOrg} team`);
    });
  });

  it("Normal user can't change visibility to public", () => {
    cy.logout();
    cy.login(normalUser, normalUserPassword);

    cy.visit(`/dashboard/teams/${parentOrg}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", parentOrg);
      cy.get("span.block").contains("Private").should("exist");

      cy.get("button#visibility").should("be.disabled");

      cy.get("button[type=submit]").click();
      cy.contains(`Successfully edited the ${parentOrg} team`);
    });
  });

  after(() => {
    cy.deleteOrganizationAPI(parentOrg);
    cy.deleteUserApi(normalUser);
  });
});
