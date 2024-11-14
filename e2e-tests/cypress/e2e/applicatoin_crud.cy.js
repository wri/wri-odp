const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const applicationSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentTopic = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const application = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;

describe("Create and edit applications", () => {
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Should create and edit team", () => {
    cy.visit("/dashboard/applications/new");
    //get input with name=title
    cy.get("input[name=title]").type(application);
    //check if input with name url has the content of "test-team"
    cy.get("input[name=name]").should("have.value", application);
    cy.get("input[name=contact_url]").type('https://contact.com')
    cy.get("input[name=help_url]").type('https://help.com')
    cy.get("input[name=homepage_url]").type('https://homepage.com')
    cy.get("textarea[name=description]").type("Test description");
    cy.get("button[type=submit]").click();
    cy.visit(`/dashboard/applications/${application}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", application);
      cy.get("input[name=title]").clear().type(application + " edited");
      cy.get("button[type=submit]").click();
      cy.visit(`/dashboard/applications/${application}/edit`).then(() => {
        cy.get("input[name=title]").should("have.value", application + " edited");
      });
    });
  });

  after(() => {
    cy.deleteGroupAPI(application);
  });
});
