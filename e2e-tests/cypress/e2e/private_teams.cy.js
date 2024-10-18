const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");
const uuid = () => Math.random().toString(36).slice(2) + "-test";
const normalUserEmail = Math.random().toString(36).slice(2) + "@test.com";
const normalUser = `${uuid()}${Cypress.env("USER_NAME_SUFFIX")}_member`;
const normalUserPassword = "test1234";



const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;

describe("Create and edit team", () => {

  before(() => {
    cy.createUserApi(normalUser, normalUserEmail, normalUserPassword);
  });
    
    beforeEach(function () {
      cy.login(ckanUserName, ckanUserPassword);
    });
  
    it("Should create team", () => {
      cy.visit("/dashboard/teams/new");
      //get input with name=title
      cy.get("input[name=title]").type(org);
      //check if input with name url has the content of "test-team"
      cy.get("input[name=name]").should("have.value", org);
      cy.get("textarea[name=description]").type("Test description");
      //get button with aria-haspopup=true

      cy.get('button[aria-haspopup=listbox]')
      .should('have.length', 2) 
      cy.get("button#visibility").click();
      cy.get("li").contains("Private").click();
      cy.get("button[type=submit]").click();

      cy.visit(`/teams/${org}`).then(() => {
        cy.contains(org).should("exist");
      });
    });

    it("Should not access public team outside", () => {
      cy.logout();
      cy.login(normalUser, normalUserPassword);
      cy.visit("/teams");
      cy.contains(org).should("not.exist");

      cy.visit(`/teams/${org}`);
      cy.contains("Team not found").should("exist");

    });

    it("Should not create public dataset with private team", () => {
        cy.visit("/dashboard/datasets/new");
    
        cy.get("input[name=title]").type(datasetSuffix);
        cy.get("input[name=name]").should("have.value", datasetSuffix);
        cy.get("input[name=url]").type("https://google.com");
        cy.get("#language").click();
        cy.get("li").contains("English").click();
        cy.get("#visibility_type").click();
        cy.get("li").contains("Public").click();
        cy.get("#team").click();
        cy.get("li").contains(org).click();
        cy.get("input[name=application]").type("GFW");
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
        cy.get('input[name="maintainers.0.email"]').type("test-maintainer-1@example.com");
        
        cy.contains("Next: Datafiles").click();
        cy.contains("Public dataset cannot be assigned to private team").should("exist");
    });

    it("Should edit team and assign public dataset and edit team back to private", () => {

        cy.visit(`/dashboard/teams/${org}/edit`).then(() => {
            cy.get("input[name=title]").should("have.value", org);
            cy.get('button[aria-haspopup=listbox]')
            .should('have.length', 2) 
            cy.get("button#visibility").click();
            cy.get("li").contains("Public").click();
            cy.get("button[type=submit]").click();
        });
        cy.visit(`/dashboard/datasets/new`);
        cy.get("input[name=title]").type(datasetSuffix);
        cy.get("input[name=name]").should("have.value", datasetSuffix);
        cy.get("input[name=url]").type("https://google.com");
        cy.get("#language").click();
        cy.get("li").contains("English").click();
        cy.get("#visibility_type").click();
        cy.get("li").contains("Public").click();
        cy.get("#team").click();
        cy.get("li").contains(org).click();
        cy.get("input[name=application]").type("GFW");
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
        cy.get('input[name="maintainers.0.email"]').type("test-maintainer-1@example.com");
        
        cy.contains("Next: Datafiles").click();
        cy.contains("Next: Map Visualizations").click();
        cy.contains("Next: Preview").click();
        cy.get('button[type="submit"]').click();
        cy.wait(10000);

        cy.visit(`/dashboard/teams/${org}/edit`).then(() => {
            cy.get("input[name=title]").should("have.value", org);
            cy.get('button[aria-haspopup=listbox]')
              .should('have.length', 2) 
              cy.get("button#visibility").click();
              cy.get("li").contains("Private").click();
            cy.get("button[type=submit]").click();
            cy.wait(10000);
            cy.contains("Team has public datasets and cannot be made private").should("exist");
        });
        
    })


  after(() => {
    cy.deleteDatasetAPI(datasetSuffix);
    cy.deleteOrganizationAPI(org);
  });
});