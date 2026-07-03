const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const topicSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentTopic = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const topic = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const nonAdminUser = `non-admin-${uuid()}`;
const nonAdminEmail = `non-admin-${uuid()}@example.com`;
const nonAdminPassword = "NonAdminPassword123";

describe("Create and edit topics", () => {
  before(() => {
    cy.createGroupAPI(parentTopic);
  });
  beforeEach(function() {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Should create and edit team", () => {
    cy.visit("/dashboard/topics/new");
    cy.get("input[name=title]").type(topic);
    cy.get("input[name=name]").should("have.value", topic);
    cy.get("textarea[name=description]").type("Test description");
    cy.get("button[aria-haspopup=listbox]").click();
    cy.contains('[role="option"]', parentTopic).click();
    cy.get("button[type=submit]").click();
    cy.visit(`/dashboard/topics/${topic}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", topic);
      cy.get("input[name=title]").clear().type(topic + " edited");
      cy.get("button[type=submit]").click();
      cy.visit(`/dashboard/topics/${topic}/edit`).then(() => {
        cy.get("input[name=title]").should("have.value", topic + " edited");
      });
    });
  });

  after(() => {
    cy.deleteGroupAPI(parentTopic);
    cy.deleteGroupAPI(topic);
    cy.logout(); // Add this line to explicitly log out after the first test group
  });
});

describe("Non-admin users cannot access topics", () => {
  before(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
    // Create a non-admin user
    cy.createUserApi(nonAdminUser, nonAdminEmail, nonAdminPassword);
  });

  beforeEach(() => {
    cy.login(nonAdminUser, nonAdminPassword);
  });

  it("Should not see Topics in sidebar", () => {
    cy.viewport(1400, 900);
    cy.visit("/dashboard");
    cy.get(".dashboard-sidebar").should("not.contain", "Topics");
    cy.get(".dashboard-sidebar").should("not.contain", "Add a Topic");
  });

  it("Should not be able to access topic creation page", () => {
    cy.viewport(1400, 900);
    cy.visit("/dashboard/topics/new");
    cy.get("#topicsForm").should("not.exist");
  });

  it("Should not be able to access topic edit page", () => {
    cy.viewport(1400, 900);
    cy.visit(`/dashboard/topics/${topic}/edit`);
    cy.get("#topicsForm").should("not.exist");
  });

  after(() => {
    cy.deleteUserApi(nonAdminUser);
  });
});
