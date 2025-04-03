const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const uuid = () => Math.random().toString(36).slice(2) + "-test";
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;
const normalUserEmail = Math.random().toString(36).slice(2) + "@test.com";
const normalUser = `${uuid()}${Cypress.env("USER_NAME_SUFFIX")}_member`;
const normalUserPassword = "test1234";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`.toLowerCase();
const parentPrivateOrg = `${uuid()}${Cypress.env(
  "ORG_NAME_SUFFIX"
)}`.toLowerCase();
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`.toLowerCase();
Cypress.on("uncaught:exception", (err, runnable) => {
  console.log(err);
  return false;
});

describe("Create and edit team", () => {
  before(() => {
    cy.createUserApi(normalUser, normalUserEmail, normalUserPassword);
    cy.createOrganizationAPI(parentOrg);
    cy.createOrganizationAPI(parentPrivateOrg, "private");
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
    cy.get("li").contains("Private").click();
    cy.wait(5000);
    cy.get("button[type=submit]").click();
    cy.wait(5000);

    cy.visit(`/teams/${org}`).then(() => {
      cy.once("uncaught:exception", () => false);
      cy.wait(10000);
      cy.contains(org).should("exist");
    });
  });

  it("should check if privat parent is not visible", () => {
    cy.visit("/teams");
    cy.wait(5000);
    cy.contains(parentPrivateOrg).should("not.exist");
  });

  it("should check if private parent visbility is truly private", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.visit(`/dashboard/teams/${parentPrivateOrg}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", parentPrivateOrg);
      cy.wait(5000);
      cy.contains("Private").should("exist");
    });
  });

  it("should assign private team to a parent", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.visit(`/dashboard/teams/${org}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", org);
      cy.get("button[aria-haspopup=listbox]")
        .contains("span", "Select a parent")
        .click();
      cy.get("li").contains(parentOrg).click();
      cy.get("button[type=submit]").click();
      cy.contains(`Successfully edited the ${org} team`);
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

  it("should assign private team to a private parent", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.visit(`/dashboard/teams/${org}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", org);
      cy.wait(5000);
      cy.scrollTo("bottom", { duration: 2000 });
      cy.screenshot("private-parent-team");
      cy.scrollTo("top", { duration: 2000 });
      cy.screenshot("private-parent-team-top");
      cy.get("button[aria-haspopup=listbox]")
        .contains("span", new RegExp(`^${parentOrg}$`, "i"))
        .click();
      cy.get("li").contains(parentPrivateOrg).click();
      cy.get("button[type=submit]").click();
      cy.contains(`Successfully edited the ${org} team`);
      cy.visit(`/dashboard/teams/${org}/edit`).then(() => {
        cy.get("input[name=title]").should("have.value", org);
      });
    });
  });

  it("should not be possible to view parent", () => {
    cy.login(normalUser, normalUserPassword);
    cy.visit("/teams");
    cy.wait(5000);
    cy.scrollTo("bottom", { duration: 2000 });
    cy.screenshot("private-parent-team");
    cy.scrollTo("top", { duration: 2000 });
    cy.screenshot("private-parent-team-top");
    cy.contains(parentPrivateOrg).should("not.exist");
    cy.contains(org).should("not.exist");
  });

  it("Should edit parent team to public", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.visit(`/dashboard/teams/${parentPrivateOrg}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", parentPrivateOrg);
      cy.get("button#visibility").click();
      cy.get("li").contains("Public").click();
      cy.get("button[type=submit]").click();
      cy.contains(`Successfully edited the ${parentPrivateOrg} team`);
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
    cy.get("li").contains("English").click();
    cy.get("#visibility_type").click();
    cy.get("li").contains("Public").click();
    cy.get("#team").click();
    cy.get("li").contains(parentPrivateOrg).click();
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
      "test-maintainer-1@example.com"
    );

    cy.contains("Next: Datafiles").click();
    cy.contains("Next: Map Visualizations").click();
    cy.contains("Next: Preview").click();
    cy.get('button[type="submit"]').click();
    cy.contains(`Successfully created the "${datasetName}" dataset`, {
      timeout: 20000,
    });

    cy.visit(`/dashboard/teams/${parentPrivateOrg}/edit`).then(() => {
      cy.get("input[name=title]").should("have.value", parentPrivateOrg);
      cy.get("button#visibility").click();
      cy.get("li").contains("Private").click();
      cy.get("button[type=submit]").click();
      cy.wait(5000);
      cy.contains(
        "Team has 1 public dataset(s) and cannot be made private"
      ).should("exist");
    });
  });

  after(() => {
    cy.deleteDatasetAPI(datasetName);
    cy.deleteOrganizationAPI(org);
    cy.deleteOrganizationAPI(parentOrg);
    cy.deleteOrganizationAPI(parentPrivateOrg);
  });
});
