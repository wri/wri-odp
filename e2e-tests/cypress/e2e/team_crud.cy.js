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
    //get input with name=title
    cy.get("input[name=title]").type(org);
    //check if input with name url has the content of "test-team"
    cy.get("input[name=name]").should("have.value", org);
    cy.get("textarea[name=description]").type("Test description");
    cy.get("input[type=file]").selectFile("cypress/fixtures/logo.png", {
      force: true,
    });
    //get button with aria-haspopup=true
    cy.get("button[aria-haspopup=listbox]").click();
    // get li element that contains the text "test-organization"
    cy.get("li").contains(parentOrg).click();
    //get button of type submit and click it
    cy.get("button[type=submit]").click();
    cy.visit(`/dashboard/teams/${org}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", org);
      cy.get("input[name=title]").clear().type(org + " edited");
      cy.get("input[type=file]").selectFile("cypress/fixtures/logo_2.jpg", {
        force: true,
      });
      cy.get("button > img")
        .first()
        .should("have.attr", "src")
        .should("include", "logo_2");
      cy.get("button[type=submit]").click();
      cy.visit(`/dashboard/teams/${org}/edit`).then(() => {
        cy.get("input[name=title]").should("have.value", org + " edited");
        cy.get("button > img")
          .first()
          .should("have.attr", "src")
          .should("include", "logo_2");
      });
    });
  });

  after(() => {
    cy.deleteOrganizationAPI(parentOrg);
    cy.deleteOrganizationAPI(org);
  });
});
