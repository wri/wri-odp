const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const topic = `${uuid()}_test_topic`;
const dataset = `${uuid()}-test-dataset`;
const user = `${uuid()}-test-user`;
const user_email = `${uuid()}@gmail.com`;

describe("Create dataset", () => {
  before(() => {
    cy.createOrganizationAPI(org);
    cy.createGroupAPI(topic);
    cy.createUserApi(user, user_email, "test_user");
  });

  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Should create dataset", () => {
    cy.visit("/dashboard/datasets/new");
    cy.get("input[name=title]").type(dataset);
    cy.get("input[name=name]").should("have.value", dataset);
    cy.get("input[name=source]").type("https://google.com");
    cy.get("#language").click();
    cy.get("li").contains('English').click();
    cy.get("#visibility_type").click();
    cy.get("li").contains('Public').click();
    cy.get("#team").click();
    cy.get("li").contains(org).click();
    cy.get("input[name=applications]").type("GFW");
    cy.get("#topicsButton").click();
    cy.get("div").contains(topic).click({ force: true });
    cy.get("button").contains('Tags').click();
    cy.get("#tagsSearchInput").type("Tag 1{enter}").clear();
    cy.get("#tagsSearchInput").type("Tag 2{enter}").clear();
    cy.get("#tagsSearchInput").type("Tag 3{enter}").clear();
    cy.get("input[name=project]").type("Project 1");
    cy.get("input[name=technical_notes]").type("https://google.com");
    cy.get("input[name=temporal_coverage_start]").type(1998);
    cy.get("input[name=temporal_coverage_end]").type(2023);
    cy.get("textarea[name=citation]").type("test");
    cy.get("#featured_dataset").click();
    cy.get("input[type=file]").selectFile("cypress/fixtures/logo.png", {
      force: true,
    });
    cy.get("textarea[name=short_description]").type("test");
    cy.get(".tiptap.ProseMirror").type("RICH TEXT EDITOR")
    cy.get("input[name=author]").type("Luccas");
    cy.get("input[name=author_email]").type("luccasmmg@gmail.com");
    cy.get("input[name=maintainer]").type("Luccas");
    cy.get("input[name=maintainer_email]").type("luccasmmg@gmail.com");
    cy.contains("More Details").click()
    cy.get(".tiptap.ProseMirror").eq(1).type("RICH TEXT EDITOR")
    cy.get(".tiptap.ProseMirror").eq(2).type("RICH TEXT EDITOR")
    cy.get("input[name=learn_more]").type("https://google.com");
    cy.contains("Open In").click()
    cy.get('button').contains("Add a open-in field").click()
    cy.get('input[name="open_in.0.title"]').type("Test");
    cy.get('input[name="open_in.0.url"]').type("https://google.com");
    cy.get('button').contains("Add a open-in field").click()
    cy.get('input[name="open_in.1.title"]').type("Test");
    cy.get('input[name="open_in.1.url"]').type("https://google.com");
    cy.contains("Custom Fields").click()
    cy.get('button').contains("Add a custom field").click()
    cy.get('input[name="extras.0.key"]').type("Test");
    cy.get('input[name="extras.0.value"]').type("Test");
    cy.get('button').contains("Add a custom field").click()
    cy.get('input[name="extras.1.key"]').type("Test 2");
    cy.get('input[name="extras.1.value"]').type("Test 2");
    cy.contains("Next: Datafiles").click()
    cy.get("input[type=file]").selectFile("cypress/fixtures/sample_csv.csv", {
      force: true,
    });
    cy.get('input[name="resources.0.title"]').clear().type("Resource for E2E Testing");
    cy.contains("Next: Preview").click()
    //get button of type submit
    cy.get('button[type="submit"]').click()
    cy.contains(`Successfully created the "${dataset}" dataset`, { timeout: 15000})
  });
  it("Should show the basic information", () => {
    cy.visit("/datasets/" + dataset);
    cy.get('h1').contains(dataset)
    cy.get('h2').contains(org)
    cy.contains('Data files').click()
    cy.contains('CSV')
  })
  it("Should show the members", () => {
    cy.addPackageCollaboratorApi(user, dataset, "editor")
    cy.visit("/datasets/" + dataset);
    cy.contains('Collaborators').click()
    cy.contains(user_email)
  })

  after(() => {
    cy.deleteOrganizationAPI(org);
    cy.deleteGroupAPI(topic);
    cy.deleteDatasetAPI(dataset)
  });
});