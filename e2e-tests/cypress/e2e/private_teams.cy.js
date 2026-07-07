const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
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

describe("Create and edit team", () => {
  before(() => {
    cy.createUserApi(normalUser, normalUserEmail, normalUserPassword);
    cy.createUserApi(editorUser, editorUserEmail, editorUserPassword);
    cy.createOrganizationAPI(parentOrg);
    cy.wait(5000);
    cy.createOrganizationMemberAPI(parentOrg, normalUser, "admin");
    cy.createOrganizationMemberAPI(parentOrg, editorUser, "editor");
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Should create team", () => {
    cy.visit("/dashboard/teams/new");
    //get input with name=title
    cy.wait(6000);
    cy.get("input[name=title]").type(org);
    //check if input with name url has the content of "test-team"
    cy.get("input[name=name]").should("have.value", org);
    cy.get("textarea[name=description]").type("Test description");
    //get button with aria-haspopup=true

    cy.get("button#visibility").click();
    cy.contains('[role="option"]', "Private").click();
    cy.wait(5000);
    cy.get("button[type=submit]").click();
    cy.wait(5000);

    cy.visit(`/teams/${org}`).then(() => {
      cy.once("uncaught:exception", () => false);
      cy.wait(10000);
      cy.contains(org).should("exist");
    });
  });

  it("should assign private team to a parent", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.visit(`/dashboard/teams/${org}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", org);
      cy.get("button[aria-haspopup=listbox]")
        .contains("span", "Select a parent")
        .click();
      cy.contains('[role="option"]', parentOrg).click();
      cy.get("button[type=submit]").click();
      cy.contains(`Successfully edited the ${org} Team`);
      cy.visit(`/dashboard/teams/${org}/edit`).then(() => {
        cy.get("input[name=title]").should("have.value", org);
      });
    });
  });

  it("should view public parent and not private child", () => {
    cy.visit("/teams");
    cy.get('input[name="search"]').type(parentOrg);
    cy.contains(parentOrg).should("exist");
    cy.contains(org).should("not.exist");
  });

  it("should edit parent team to private", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.visit(`/dashboard/teams/${parentOrg}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", parentOrg);
      cy.get("button#visibility").click();
      cy.contains('[role="option"]', "Private").click();
      cy.get("button[type=submit]").click();
      cy.contains(`Successfully edited the ${parentOrg} Team`);
      cy.wait(5000);
    });
  });

  it("should not be possible to view parent", () => {
    cy.visit("/teams");
    cy.contains(parentOrg).should("not.exist");
    cy.contains(org).should("not.exist");
  });

  it("Should edit parent team to public", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.visit(`/dashboard/teams/${parentOrg}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", parentOrg);
      cy.get("button#visibility").click();
      cy.contains('[role="option"]', "Public").click();
      cy.get("button[type=submit]").click();
      cy.contains(`Successfully edited the ${parentOrg} Team`);
    });
  });

  it("Should edit team and assign public dataset and edit team back to private", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.visit(`/dashboard/datasets/new`);
    cy.wait(5000);
    cy.get("input[name=title]").type(datasetName);
    cy.get("input[name=name]").should("have.value", datasetName);
    cy.get("input[name=url]").type("https://google.com");
    cy.get("#language").click();
    cy.contains('[role="option"]', "English").click();
    cy.get("#visibility_type").click();
    cy.contains('[role="option"]', "Public").click();
    cy.get("#team").click();
    cy.contains('[role="option"]', parentOrg).click();
    cy.get("button").contains("Tags").click();
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
    cy.contains(`Successfully created the "${datasetName}" Dataset`, {
      timeout: 20000,
    });

    cy.visit(`/dashboard/teams/${parentOrg}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", parentOrg);
      cy.get("button#visibility").click();
      cy.contains('[role="option"]', "Private").click();
      cy.get("button[type=submit]").click();
      cy.wait(5000);
      cy.contains(
        "Team has 1 public Dataset(s) and cannot be made private",
      ).should("exist");
    });
  });

  // normal user should be able to edit parentOrg
  it("should edit parent team description and visibility to private by normal user", () => {
    cy.login(normalUser, normalUserPassword);
    cy.visit(`/dashboard/teams/${parentOrg}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", parentOrg);
      cy.get("textarea[name=description]").clear().type("Test description");
      cy.get("button[type=submit]").click();
      cy.contains(`Successfully edited the ${parentOrg} Team`);
    });

    cy.wait(5000);

    cy.visit(`/dashboard/teams/${parentOrg}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", parentOrg);
      cy.get("textarea[name=description]").should(
        "have.value",
        "Test description",
      );
    });
  });
  it("Should create a public team", () => {
    cy.login(editorUserEmail, editorUserPassword);
    cy.visit("/dashboard/teams/new");
    //get input with name=title
    cy.wait(6000);
    cy.get("input[name=title]").type(org2);
    //check if input with name url has the content of "test-team"
    cy.get("input[name=name]").should("have.value", org2);
    cy.get("textarea[name=description]").type("Test description");
    //get button with aria-haspopup=true

    cy.get("button[aria-haspopup=listbox]")
      .contains("span", "Select a parent")
      .click();
    cy.contains('[role="option"]', parentOrg).click();

    cy.get("button#visibility").click();
    cy.contains('[role="option"]', "Public").click();
    cy.wait(5000);
    cy.get("button[type=submit]").click();
    cy.wait(5000);

    cy.visit(`/teams/${org2}`).then(() => {
      cy.once("uncaught:exception", () => false);
      cy.wait(10000);
      cy.contains(org2).should("exist");
    });
  });

  it("Should create a public datasset under subteam: editor", () => {
    cy.login(editorUserEmail, editorUserPassword);
    cy.visit(`/dashboard/datasets/new`);
    cy.wait(5000);
    cy.get("input[name=title]").type(datasetName2);
    cy.get("input[name=name]").should("have.value", datasetName2);
    cy.get("input[name=url]").type("https://google.com");
    cy.get("#language").click();
    cy.contains('[role="option"]', "English").click();
    cy.get("#visibility_type").click();
    cy.contains('[role="option"]', "Public").click();
    cy.get("#team").click();
    cy.contains('[role="option"]', org2).click();
    cy.get("button").contains("Tags").click();
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
    cy.contains(`Successfully created the "${datasetName2}" Dataset`, {
      timeout: 20000,
    });
  });

  it("Should edit a public datasset under subteam: editor", () => {
    cy.login(editorUserEmail, editorUserPassword);
    cy.visit("/dashboard/datasets/" + datasetName2 + "/edit");
    cy.wait(5000);
    cy.get("input[name=title]")
      .clear()
      .type(datasetName2 + " EDITED");

    cy.get("button").contains("Update Dataset").click();
    cy.contains(`Successfully edited the "${datasetName2 + " EDITED"}" Dataset`, {
      timeout: 60000,
    });
    cy.url({ timeout: 60000 }).should("include", `/datasets/${datasetName2}`);
    cy.visitDatasetPage(datasetName2, {
      waitForTabs: false,
      title: datasetName2 + " EDITED",
    });
  });

  it("Should create a public datasset under subteam: admin", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.visit(`/dashboard/datasets/new`);
    cy.wait(5000);
    cy.get("input[name=title]").type(datasetName3);
    cy.get("input[name=name]").should("have.value", datasetName3);
    cy.get("input[name=url]").type("https://google.com");
    cy.get("#language").click();
    cy.contains('[role="option"]', "English").click();
    cy.get("#visibility_type").click();
    cy.contains('[role="option"]', "Public").click();
    cy.get("#team").click();
    cy.contains('[role="option"]', parentOrg).click();
    cy.get("button").contains("Tags").click();
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
    cy.contains(`Successfully created the "${datasetName3}" Dataset`, {
      timeout: 20000,
    });
  });

  it("Should edit a public datasset under subteam: editor", () => {
    cy.login(editorUserEmail, editorUserPassword);
    cy.visit("/dashboard/datasets/" + datasetName3 + "/edit");
    cy.wait(5000);
    cy.get("input[name=title]")
      .clear()
      .type(datasetName3 + " EDITED");

    cy.get("button").contains("Update Dataset").click();
    cy.contains(`Successfully edited the "${datasetName3 + " EDITED"}" Dataset`, {
      timeout: 60000,
    });
    cy.url({ timeout: 60000 }).should("include", `/datasets/${datasetName3}`);
    cy.visitDatasetPage(datasetName3, {
      waitForTabs: false,
      title: datasetName3 + " EDITED",
    });
  });

  after(() => {
    cy.deleteDatasetAPI(datasetName);
    cy.deleteDatasetAPI(datasetName2);
    cy.deleteDatasetAPI(datasetName3);
    cy.deleteOrganizationAPI(org);
    cy.deleteOrganizationAPI(org2);
    cy.deleteOrganizationAPI(parentOrg);
  });
});
