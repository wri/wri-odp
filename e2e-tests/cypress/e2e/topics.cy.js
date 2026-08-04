const getRandomOrganizationName = () =>
  Math.random().toString(36).slice(2) + Cypress.env("ORG_NAME_SUFFIX");
const getRandomGroupName = () =>
  Math.random().toString(36).slice(2) + Cypress.env("GROUP_SUFFIX");

const subgroup = "subtopic" + getRandomGroupName();

const orgs = [];
const groups = [];

Cypress.on("uncaught:exception", (err, runnable) => {
  console.log(err);
  return false;
});

describe("Explore data page", () => {
  before(() => {
    [...new Array(2).keys()].forEach(() => {
      const name = getRandomOrganizationName();
      cy.createOrganizationAPI(name);
      orgs.push(name);
    });

    [...new Array(2).keys()].forEach(() => {
      const name = getRandomGroupName();
      cy.createGroupAPI(name);
      groups.push(name);
    });

    cy.createGroupAPI(subgroup, groups[0]);
  });

  it("search topic", () => {
    cy.visit("/topics");
    // TopicsSearch filters client-side via onChange; Enter submits the form
    // and reloads with an empty React query, so type without submitting.
    cy.get('[name="search"]', { timeout: 15000 })
      .should("be.visible")
      .clear()
      .type(groups[0]);
    cy.contains(`${groups[0]}`, { timeout: 40000 });
  });

  it("search teams", () => {
    cy.visit("/teams");
    cy.get('[name="search"]', { timeout: 15000 })
      .should("be.visible")
      .clear()
      .type(orgs[0]);
    cy.contains(`${orgs[0]}`, { timeout: 40000 });
  });

  it("visit topic page", () => {
    cy.visit(`/topics/${groups[0]}`);
    cy.contains(`${groups[0]}`, { timeout: 40000 });
    cy.contains("SubTopics");
  });

  it("should display not found page", () => {
    cy.visit("/topics/randomtopicname");
    cy.contains("Sorry, we couldn’t find the page you’re looking for.", {
      timeout: 40000,
    });
  });

  it("shoud display subtopic page", () => {
    cy.visit(`/topics/${subgroup}`);
    cy.contains(`${subgroup}`, { timeout: 40000 });
  });

  after(() => {
    cy.deleteGroupAPI(subgroup);
    groups.forEach((name) => cy.deleteGroupAPI(name));
    groups.forEach((name) => cy.purgeGroup(name));
    orgs.forEach((name) => cy.deleteOrganizationAPI(name));
    orgs.forEach((name) => cy.purgeOrganization(name));
  });
});
