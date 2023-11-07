const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const topicSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentTopic = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const topic = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;

describe("Create and edit topics", () => {
  before(() => {
    cy.createGroupAPI(parentTopic);
  });
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Should create and edit team", () => {
    cy.visit("/dashboard/topics/new");
    //get input with name=title
    cy.get("input[name=title]").type(topic);
    //check if input with name url has the content of "test-team"
    cy.get("input[name=name]").should("have.value", topic);
    cy.get("textarea[name=description]").type("Test description");
    cy.get("input[type=file]").selectFile("cypress/fixtures/logo.png", {
      force: true,
    });
    //get button with aria-haspopup=true
    cy.get("button[aria-haspopup=listbox]").click();
    // get li element that contains the text "test-topicanization"
    cy.get("li").contains(parentTopic).click();
    //get button of type submit and click it
    cy.get("button[type=submit]").click();
    cy.visit(`/dashboard/topics/${topic}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", topic);
      cy.get("input[name=title]").clear().type(topic + " edited");
      cy.get("input[type=file]").selectFile("cypress/fixtures/logo_2.jpg", {
        force: true,
      });
      cy.get("button > img", { timeout: 10000})
        .first()
        .should("have.attr", "src")
        .should("include", "logo_2");
      cy.get("button[type=submit]").click();
      cy.visit(`/dashboard/topics/${topic}/edit`).then(() => {
        cy.get("input[name=title]").should("have.value", topic + " edited");
        cy.get("button > img", { timeout: 10000})
          .first()
          .should("have.attr", "src")
          .should("include", "logo_2");
      });
    });
  });

  after(() => {
    cy.deleteGroupAPI(parentTopic);
    cy.deleteGroupAPI(topic);
  });
});
