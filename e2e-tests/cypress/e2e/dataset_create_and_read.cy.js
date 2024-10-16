const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const topic = `${uuid()}_test_topic`;
const dataset = `${uuid()}bbb-test-dataset`;
const user = `${uuid()}-test-user`;
const user_email = `${uuid()}@gmail.com`;
const user_2 = `${uuid()}-test-user`;
const user_email_2 = `${uuid()}@gmail.com`;

describe("Create dataset", () => {
  before(() => {
    cy.createUserApi(user, user_email, "test_user");
    cy.createUserApi(user_2, user_email_2, "test_user_2");
    cy.createOrganizationAPI(org);
    cy.createOrganizationMemberAPI(org, user, "admin");
    cy.createGroupAPI(topic);
  });

  beforeEach(function () {
    cy.login(user, "test_user");
  });

  it("Should create dataset", () => {
    cy.visit("/dashboard/datasets/new");

    cy.get("input[name=title]").type(dataset);
    cy.get("input[name=name]").should("have.value", dataset);
    cy.get("input[name=url]").type("https://google.com");
    cy.get("#language").click();
    cy.get("li").contains("English").click();
    cy.get("#visibility_type").click();
    cy.get("li").contains("Public").click();
    cy.get("#team").click();
    cy.get("li").contains(org).click();
    cy.get("input[name=application]").type("GFW");
    cy.get("#topicsButton").click();
    cy.get("div").contains(topic).click({ force: true });
    cy.get("button").contains("Tags").click();
    cy.get("#tagsSearchInput").type("Tag 1{enter}", { force: true }).clear();
    cy.get("#tagsSearchInput").type("Tag 2{enter}", { force: true }).clear();
    cy.get("#tagsSearchInput").type("Tag 3{enter}", { force: true }).clear();
    cy.get("input[name=project]").focus().type("Project 1");
    cy.get("input[name=technical_notes]").type("https://google.com");
    cy.get("input[name=temporal_coverage_start]").type(1998);
    cy.get("input[name=temporal_coverage_end]").type(2023);
    cy.get("textarea[name=citation]").type("test");
    cy.get("#featured_dataset").click();
    cy.get(
      'input[type=file][accept="image/png image/jpeg image/svg"]',
    ).selectFile("cypress/fixtures/logo.png", {
      force: true,
    });
    cy.get("textarea[name=short_description]").type("test");
    cy.contains("Description").parent().parent().find(".tiptap.ProseMirror").type("RICH TEXT EDITOR");

    cy.contains("Add Author").click();
    cy.get('input[name="authors.0.name"]').type("Test Author 1");
    cy.get('input[name="authors.0.email"]').type("test-author-1@example.com");
    cy.contains("Add Author").click();
    cy.get('input[name="authors.1.name"]').type("Test Author 2");
    cy.get('input[name="authors.1.email"]').type("test-author-2@example.com");

    cy.contains("Add Maintainer").click();
    cy.get('input[name="maintainers.0.name"]').type("Test Maintainer 1");
    cy.get('input[name="maintainers.0.email"]').type("test-maintainer-1@example.com");
    cy.contains("Add Maintainer").click();
    cy.get('input[name="maintainers.1.name"]').type("Test Maintainer 2");
    cy.get('input[name="maintainers.1.email"]').type("test-maintainer-2@example.com");

    cy.contains("More Details").click();
    cy.contains("More Details").parent().parent().as("moredetails")
    cy.get("@moredetails").get(".tiptap.ProseMirror").eq(1).type("RICH TEXT EDITOR");
    cy.get("@moredetails").get(".tiptap.ProseMirror").eq(2).type("RICH TEXT EDITOR");
    cy.get("input[name=learn_more]").type("https://google.com");
    cy.contains("Link to Another WRI Product").click();
    cy.get("button").contains("Add a link to another wri product").click();
    cy.get('input[name="open_in.0.title"]').type("Test");
    cy.get('input[name="open_in.0.url"]').type("https://google.com");
    cy.get("button").contains("Add a link to another wri product").click();
    cy.get('input[name="open_in.1.title"]').type("Test");
    cy.get('input[name="open_in.1.url"]').type("https://google.com");
    cy.contains("Custom Fields").click();
    cy.get("button").contains("Add a custom field").click();
    cy.get('input[name="extras.0.key"]').type("Test");
    cy.get('input[name="extras.0.value"]').type("Test");
    cy.get("button").contains("Add a custom field").click();
    cy.get('input[name="extras.1.key"]').type("Test 2");
    cy.get('input[name="extras.1.value"]').type("Test 2");
    cy.contains("Next: Datafiles").click();
    cy.get('.datafile-accordion-trigger').eq(0).click()
    cy.get("input[type=file]").selectFile("cypress/fixtures/logo.png", {
      force: true,
    });
    cy.get('input[name="resources.0.title"]').clear().type("Logo");
    cy.wait(5000);
    cy.contains("Next: Map Visualizations").click();
    cy.contains("Next: Preview").click();
    //get button of type submit
    cy.get('button[type="submit"]').click();
    cy.wait(10000);
    // cy.contains(`Successfully created the "${dataset}" dataset`, {
    //   timeout: 20000,
    // });
    // cy.wait(15000);
  });

  it(
    "Should show the basic information",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/datasets/" + dataset);
      cy.get("h1").contains(dataset, { timeout: 15000 });
      cy.get("h2").contains(org);
      cy.contains("Data files").click();
      cy.contains("PNG");
      cy.contains("Contact").click();

      cy.contains("Test Author 1");
      cy.contains("test-author-1@example.com");
      cy.contains("Test Author 2");
      cy.contains("test-author-2@example.com");
      cy.contains("Test Maintainer 1");
      cy.contains("test-maintainer-1@example.com");
      cy.contains("Test Maintainer 2");
      cy.contains("test-maintainer-2@example.com");
    },
  );

  it(
    "Should show API endpoints",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/datasets/" + dataset);
      cy.contains("API").click({ force: true });
      cy.contains("Datasets API")
    },
  );

  it(
    "Should show the members",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.addPackageCollaboratorApi(user_2, dataset, "editor");
      cy.visit("/datasets/" + dataset);
      cy.contains("Collaborators").click();
      cy.contains(user_2);
    },
  );

  it("Edit metadata",  {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    }, () => {
    cy.visit("/dashboard/datasets/" + dataset + "/edit");
    cy.get("input[name=title]")
      .clear()
      .type(dataset + " EDITED");
    cy.get("input[name=url]")
      .clear()
      .type("https://google.com" + ".br");

    cy.contains("Remove Author").click();
    cy.contains("Remove Maintainer").click();

    cy.contains("Add Maintainer").click();
    cy.get('input[name="maintainers.1.name"]').type("Test Maintainer 3");
    cy.get('input[name="maintainers.1.email"]').type("test-maintainer-3@example.com");

    cy.contains("More Details").click();
    cy.contains("More Details").parent().parent().as("moredetails")
    cy.get("@moredetails").get(".tiptap.ProseMirror").eq(1).type("EDITED");
    cy.get("@moredetails").get(".tiptap.ProseMirror").eq(2).type("EDITED");
    cy.contains("Data Files").click();
    cy.wait(5000);
    cy.get("button").contains("Add another data file").click();
    cy.wait(500)
    cy.get('.datafile-accordion-trigger').eq(1).click()
    cy.get("input[type=file]").eq(1).selectFile("cypress/fixtures/logo_2.jpg", {
      force: true,
    });
    cy.get('input[name="resources.1.title"]').clear().type("jpg image");
    cy.contains("Collaborators").click();
    // cy.get("button").contains("Add another collaborator").click();
    // this logic fails on second retry since dataset is actually edited
    // cy.get("input").eq(1).click().type(user_2);
    // cy.get("li").contains(user_2).click(); 
    cy.get("button").contains("Update Dataset").click();
    // cy.contains(`Successfully edited the "${dataset + " EDITED"}" dataset`, {
    //   timeout: 30000,
    // });
    
  });

  it(
    "Should show the basic information edited",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/datasets/" + dataset);
      cy.get("h1").contains(dataset + " EDITED", { timeout: 30000 });
      cy.contains("Data files").click();
      cy.contains("jpg");
      cy.contains("Contact").click();
      cy.contains("Test Author 2");
      cy.contains("test-author-2@example.com");
      cy.contains("Test Maintainer 2");
      cy.contains("test-maintainer-2@example.com");
      cy.contains("Test Maintainer 3");
      cy.contains("test-maintainer-3@example.com");
      cy.contains("Test Author 1").should("not.exist");
      cy.contains("test-author-1@example.com").should("not.exist");
      cy.contains("Test Maintainer 1").should("not.exist");
      cy.contains("test-maintainer-1@example.com").should("not.exist");
    },
  );

  // it(
  //   "Should show the new member",
  //   {
  //     retries: {
  //       runMode: 5,
  //       openMode: 0,
  //     },
  //   },
  //   () => {
  //     cy.visit("/datasets/" + dataset);
  //     cy.contains("Collaborators").click();
  //     cy.contains(user_2);
  //     cy.logout();
  //     cy.login(user_2, "test_user_2");
  //     cy.visit("/dashboard/notifications");
  //     cy.contains(ckanUserName);
  //     cy.contains(" added you as a collaborator (member) for the dataset");
  //   },
  // );

  after(() => {
    cy.deleteOrganizationAPI(org);
    cy.deleteGroupAPI(topic);
    cy.deleteDatasetAPI(dataset);
  });
});

