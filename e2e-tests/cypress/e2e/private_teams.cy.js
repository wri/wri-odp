const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const uuid = () => Math.random().toString(36).slice(2) + "-test";
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;
const datasetName2 = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;
const datasetName3 = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;
const normalUserEmail = Math.random().toString(36).slice(2) + "@test.com";
const normalUser = `${uuid()}${Cypress.env("USER_NAME_SUFFIX")}_member`;
const normalUserPassword = "test1234";

const editorUser = `${uuid()}${Cypress.env("USER_NAME_SUFFIX")}_editor`;
const editorUserEmail = Math.random().toString(36).slice(2) + "@test.com";
const editorUserPassword = "test1234";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`.toLowerCase();
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`.toLowerCase();
const org2 = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`.toLowerCase();
Cypress.on("uncaught:exception", (err, runnable) => {
  console.log(err);
  return false;
});

function fillPublicDatasetWizard(name, team) {
  cy.visit(`/dashboard/datasets/new`);
  cy.get("input[name=title]", { timeout: 15000 }).should("be.visible").type(name);
  cy.get("input[name=name]").should("have.value", name);
  cy.get("input[name=url]").type("https://google.com");
  cy.get("#language").click();
  cy.contains('[role="option"]', "English").click();
  cy.get("#visibility_type").click();
  cy.contains('[role="option"]', "Public").click();
  cy.get("#team").click();
  cy.contains('[role="option"]', team).click();
  cy.get("button").contains("Keywords").click();
  cy.get("#tagsSearchInput").type("Tag 1{enter}", { force: true }).clear();
  cy.get("input[name=project]").focus().type("Project 1");
  cy.get("input[name=technical_notes]").type("https://google.com");
  cy.get("textarea[name=short_description]").type("test");

  cy.contains("Add Author").click();
  cy.get('input[name="authors.0.name"]').type("Test Author 1");
  cy.get('input[name="authors.0.email"]').type("test-author-1@example.com");

  cy.contains("Add Maintainer").click();
  cy.get('input[name="maintainers.0.name"]').type("Test Maintainer 1");
  cy.get('input[name="maintainers.0.email"]').type(
    "test-maintainer-1@example.com",
  );

  cy.contains("Next: Data Files").click();
  cy.contains("Next: Map Visualizations").click();
  cy.contains("Next: Preview").click();
  cy.get('button[type="submit"]').click();
  cy.contains(`Successfully created the "${name}" Dataset`, {
    timeout: 20000,
  });
}

describe("Create and edit team", () => {
  before(() => {
    cy.createUserApi(normalUser, normalUserEmail, normalUserPassword);
    cy.createUserApi(editorUser, editorUserEmail, editorUserPassword);
    cy.createOrganizationAPI(parentOrg);
    cy.createOrganizationMemberAPI(parentOrg, normalUser, "admin");
    cy.createOrganizationMemberAPI(parentOrg, editorUser, "editor");
  });

  it("Should create team", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.visit("/dashboard/teams/new");
    cy.get("input[name=title]", { timeout: 15000 }).should("be.visible").type(org);
    cy.get("input[name=name]").should("have.value", org);
    cy.get("textarea[name=description]").type("Test description");

    cy.get("button#visibility").click();
    cy.contains('[role="option"]', "Private").click();
    cy.get("button[type=submit]").click();
    cy.visit(`/dashboard/teams/${org}/edit`, { timeout: 30000 });
    cy.get("input[name=title]", { timeout: 15000 }).should("have.value", org);

    cy.visit(`/teams/${org}`);
    cy.contains(org, { timeout: 15000 }).should("exist");
  });

  it("should assign private team to a parent", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.visit(`/dashboard/teams/${org}/edit`);
    cy.get("input[name=title]", { timeout: 20000 }).should("have.value", org);
    cy.get("button[aria-haspopup=listbox]")
      .contains("span", "Select a parent")
      .click();
    cy.contains('[role="option"]', parentOrg).click();
    cy.get("button[type=submit]").click();
    cy.contains(`Successfully edited the ${org} Team`);
    cy.visit(`/dashboard/teams/${org}/edit`);
    cy.get("input[name=title]").should("have.value", org);
  });

  it("should view public parent and not private child", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.visit("/teams");
    cy.get('input[name="search"]').type(parentOrg);
    cy.contains(parentOrg).should("exist");
    cy.contains(org).should("not.exist");
  });

  it("should edit parent team to private", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.visit(`/dashboard/teams/${parentOrg}/edit`);
    cy.get("input[name=title]", { timeout: 20000 }).should("have.value", parentOrg);
    cy.get("button#visibility").click();
    cy.contains('[role="option"]', "Private").click();
    cy.get("button[type=submit]").click();
    cy.contains(`Successfully edited the ${parentOrg} Team`);
  });

  it("should not be possible to view parent", () => {
    // Private teams remain visible to sysadmins / members. Assert the public catalog.
    cy.clearCookies();
    cy.clearLocalStorage();
    Cypress.session.clearAllSavedSessions();
    cy.visit("/teams");
    cy.get('input[name="search"]', { timeout: 15000 })
      .should("be.visible")
      .clear()
      .type(parentOrg);
    cy.contains(parentOrg).should("not.exist");
    cy.contains(org).should("not.exist");
  });

  it("Should edit parent team to public", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.visit(`/dashboard/teams/${parentOrg}/edit`);
    cy.get("input[name=title]", { timeout: 20000 }).should("have.value", parentOrg);
    cy.get("button#visibility").click();
    cy.contains('[role="option"]', "Public").click();
    cy.get("button[type=submit]").click();
    cy.contains(`Successfully edited the ${parentOrg} Team`);
  });

  it("Should assign public dataset and fail making team private", () => {
    cy.login(ckanUserName, ckanUserPassword);
    // Seed via API — this case tests the team visibility guard, not create UI.
    cy.createDatasetAPI(parentOrg, datasetName, true, {
      private: false,
      visibility_type: "public",
      short_description: "private teams e2e",
      technical_notes: "https://google.com",
    });
    cy.approvePendingDatasetAPI(datasetName);

    cy.visit(`/dashboard/teams/${parentOrg}/edit`);
    cy.get("input[name=title]", { timeout: 20000 }).should("have.value", parentOrg);
    cy.get("button#visibility").click();
    cy.contains('[role="option"]', "Private").click();
    cy.get("button[type=submit]").click();
    cy.contains(
      "Team has 1 public Dataset(s) and cannot be made private",
      { timeout: 15000 },
    ).should("exist");
  });

  it("should edit parent team description by normal user", () => {
    cy.login(normalUser, normalUserPassword);
    cy.visit(`/dashboard/teams/${parentOrg}/edit`);
    cy.get("input[name=title]", { timeout: 30000 }).should(
      "have.value",
      parentOrg,
    );
    cy.get("textarea[name=description]").clear().type("Test description");
    cy.get("button[type=submit]").click();
    cy.contains(`Successfully edited the ${parentOrg} Team`);

    cy.visit(`/dashboard/teams/${parentOrg}/edit`);
    cy.get("input[name=title]", { timeout: 30000 }).should(
      "have.value",
      parentOrg,
    );
    cy.get("textarea[name=description]").should(
      "have.value",
      "Test description",
    );
  });

  it("Should create a public team", () => {
    cy.login(editorUserEmail, editorUserPassword);
    cy.visit("/dashboard/teams/new");
    cy.get("input[name=title]", { timeout: 15000 }).should("be.visible").type(org2);
    cy.get("input[name=name]").should("have.value", org2);
    cy.get("textarea[name=description]").type("Test description");

    cy.get("button[aria-haspopup=listbox]")
      .contains("span", "Select a parent")
      .click();
    cy.contains('[role="option"]', parentOrg).click();

    cy.get("button#visibility").click();
    cy.contains('[role="option"]', "Public").click();
    cy.get("button[type=submit]").click();
    cy.visit(`/dashboard/teams/${org2}/edit`, { timeout: 30000 });
    cy.get("input[name=title]", { timeout: 15000 }).should("have.value", org2);

    cy.visit(`/teams/${org2}`);
    cy.contains(org2, { timeout: 15000 }).should("exist");
  });

  it("Should create a public dataset under subteam: editor", () => {
    cy.login(editorUserEmail, editorUserPassword);
    fillPublicDatasetWizard(datasetName2, org2);
  });

  it("Should edit a public dataset under subteam: editor", () => {
    cy.login(editorUserEmail, editorUserPassword);
    cy.visit("/dashboard/datasets/" + datasetName2 + "/edit");
    cy.get("input[name=title]", { timeout: 15000 })
      .clear()
      .type(datasetName2 + " EDITED");
    cy.get("button").contains("Update Dataset").click();
    cy.contains(/Successfully edited|Successfully/i, { timeout: 30000 });

    cy.visit("/datasets/" + datasetName2);
    cy.get("h1", { timeout: 15000 })
      .contains(datasetName2 + " EDITED")
      .should("exist");
  });

  it("Should create a public dataset under parent: admin", () => {
    cy.login(ckanUserName, ckanUserPassword);
    fillPublicDatasetWizard(datasetName3, parentOrg);
  });

  it("Should edit a public dataset under parent: editor", () => {
    cy.login(editorUserEmail, editorUserPassword);
    cy.visit("/dashboard/datasets/" + datasetName3 + "/edit");
    cy.get("input[name=title]", { timeout: 15000 })
      .clear()
      .type(datasetName3 + " EDITED");
    cy.get("button").contains("Update Dataset").click();
    cy.contains(/Successfully edited|Successfully/i, { timeout: 30000 });

    cy.visit("/datasets/" + datasetName3);
    cy.get("h1", { timeout: 15000 })
      .contains(datasetName3 + " EDITED")
      .should("exist");
  });

  after(() => {
    const api = `${Cypress.config().apiUrl}/api/3/action`;
    const headers = { Authorization: Cypress.env("API_KEY") };
    [datasetName, datasetName2, datasetName3].forEach((id) => {
      cy.request({
        method: "POST",
        url: `${api}/package_delete`,
        headers,
        body: { id },
        failOnStatusCode: false,
      });
    });
    [org, org2, parentOrg].forEach((id) => {
      cy.request({
        method: "POST",
        url: `${api}/organization_delete`,
        headers,
        body: { id },
        failOnStatusCode: false,
      });
    });
  });
});
