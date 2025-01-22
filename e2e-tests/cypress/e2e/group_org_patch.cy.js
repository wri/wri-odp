const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");

// Function to generate a random organization or group name
const uuid = () => Math.random().toString(36).slice(2) + "-test";

describe("Create and verify organizations and groups", () => {

  const organizations = [];
  const groups = [];
  const numOfEntries = 50;

  before(() => {
    // Create 50 organizations using cy.createOrganizationAPI
    for (let i = 1; i <= numOfEntries; i++) {
      const org = `abc-${Cypress.env("ORG_NAME_SUFFIX")}-${i}`;
      organizations.push(org);
      cy.createOrganizationAPI(org);
    }

    // Create 50 groups using cy.createGroupAPI
    for (let i = 1; i <= numOfEntries; i++) {
        
      const group = `abc-${Cypress.env("GROUP_SUFFIX")}-${i}`;
      groups.push(group);
      cy.createGroupAPI(group);
    }
  });

  beforeEach(() => {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Should verify the description of the 50th organization", () => {
    const lastOrg = organizations[organizations.length - 1]; // 50th organization
    cy.visit(`/teams/${lastOrg}`);
    cy.contains("Some organization description").should("exist");
  });

  it("Should load the edit page and verify the parent field contains 50 organizations", () => {
    cy.visit("/dashboard/teams/new"); // New organization creation page

    // Click on the parent organization dropdown and check if it contains all 50 organizations
    cy.get("button[aria-haspopup=listbox]").click();
    organizations.forEach((org) => {
      cy.get("li").contains(org).should("exist"); // Ensure every organization is listed in the dropdown
    });
  });

  it("Should verify the description of the 50th group", () => {
    const lastGroup = groups[groups.length - 1]; // 50th group
    cy.visit(`/topics/${lastGroup}`);
    cy.contains("Some group description").should("exist");
  });

  after(() => {
    // Cleanup by deleting all organizations and groups created during the tests
    organizations.forEach((org) => {
      cy.deleteOrganizationAPI(org);
    });

    groups.forEach((group) => {
      cy.deleteGroupAPI(group);
    });
  });
});
