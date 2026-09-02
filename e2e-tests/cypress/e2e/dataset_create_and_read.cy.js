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

  beforeEach(function() {
    cy.login(user, "test_user");
  });

  it("Should fail to create dataset without team", () => {
    cy.visit("/dashboard/datasets/new");

    cy.get("input[name=title]").type(dataset);
    cy.get("input[name=name]").should("have.value", dataset);
    // Intentionally skip team selection
    cy.get("textarea[name=short_description]").type("test");
    cy.contains("Add data maintainer").click();
    cy.get('input[name="maintainers.0.name"]').type("Test Maintainer 1");
    cy.get('input[name="maintainers.0.email"]').type(
      "test-maintainer-1@example.com",
    );
    cy.contains("Next: Data Files").click();

    // Verify the validation error for missing team
    cy.contains("Team is required").should("be.visible");
  });

  it("Should create dataset", () => {
    cy.visit("/dashboard/datasets/new");

    cy.get("input[name=title]").type(dataset);
    cy.get("input[name=name]").should("have.value", dataset);
    cy.get("#team", { timeout: 15000 }).should("be.visible").click();
    cy.get('[role="listbox"]').should("be.visible");
    cy.contains('[role="option"]', org).click();
    cy.get("textarea[name=short_description]").type("test");
    cy.contains("Description")
      .parent()
      .parent()
      .find(".tiptap.ProseMirror")
      .type("RICH TEXT EDITOR");

    cy.contains("Add data maintainer").click();
    cy.get('input[name="maintainers.0.name"]').type("Test Maintainer 1");
    cy.get('input[name="maintainers.0.email"]').type(
      "test-maintainer-1@example.com",
    );
    cy.contains("Add data maintainer").click();
    cy.get('input[name="maintainers.1.name"]').type("Test Maintainer 2");
    cy.get('input[name="maintainers.1.email"]').type(
      "test-maintainer-2@example.com",
    );

    cy.contains("Additional reading").click();
    cy.contains("Add link").click();
    cy.get('input[name="additional_reading.0.title"]').type("Related Article");
    cy.get('input[name="additional_reading.0.url"]').type("https://google.com");

    cy.contains("Methodology").click();
    cy.get("input[name=technical_notes]").type("https://google.com");

    cy.contains("Next: Data Files").click();
    cy.contains("Add another Data File", { timeout: 15000 }).should("be.visible");
    cy.get(".datafile-accordion-trigger", { timeout: 15000 }).eq(0).click();
    cy.get("input[type=file]").selectFile("cypress/fixtures/logo.png", {
      force: true,
    });
    cy.get('input[name="resources.0.title"]').clear().type("Logo");
    cy.wait(5000);
    cy.contains("Next: Map Visualizations").click();
    cy.contains("Next: Preview").click();
    cy.get('button[type="submit"]').click();
    cy.contains(`Successfully created the "${dataset}" Dataset`, {
      timeout: 30000,
    });
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
      cy.contains("Data Files", { timeout: 20000 }).click();
      cy.contains("PNG");
      cy.contains("Contact").click();
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
      cy.contains("Datasets API");
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
      cy.contains("Collaborators", { timeout: 15000 }).click();
      cy.contains(user_2);
    },
  );

  it(
    "Should remove additional reading and persist",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/dashboard/datasets/" + dataset + "/edit");
      cy.contains("Additional reading").click();
      cy.get('input[name="additional_reading.0.url"]').should(
        "have.value",
        "https://google.com",
      );
      cy.get('button[aria-label="Remove additional reading item"]')
        .first()
        .click();
      cy.get("button").contains("Update Dataset").click();
      cy.contains("Successfully edited", { timeout: 30000 });

      cy.visit("/dashboard/datasets/" + dataset + "/edit");
      cy.contains("Additional reading").click();
      cy.get('input[name="additional_reading.0.url"]').should("not.exist");
    },
  );

  it(
    "Edit metadata",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/dashboard/datasets/" + dataset + "/edit");
      cy.get("input[name=title]", { timeout: 15000 })
        .clear()
        .type(dataset + " EDITED");

      cy.contains("Remove data maintainer").click();

      cy.contains("Add data maintainer").click();
      cy.get('input[name="maintainers.1.name"]').type("Test Maintainer 3");
      cy.get('input[name="maintainers.1.email"]').type(
        "test-maintainer-3@example.com",
      );

      cy.contains("Methodology").click();
      cy.get("input[name=technical_notes]").clear().type("https://google.com.br");

      cy.contains("Data Files", { timeout: 20000 }).click();
      cy.wait(5000);
      cy.get("button").contains("Add another Data File").click();
      cy.wait(500);
      cy.get(".datafile-accordion-trigger").eq(1).click();
      cy.get("input[type=file]")
        .eq(0)
        .selectFile("cypress/fixtures/logo_2.jpg", {
          force: true,
        });
      cy.get('input[name="resources.1.title"]').clear().type("jpg image");
      cy.contains("Collaborators").click();
      cy.get("button").contains("Update Dataset").click();
      cy.contains("Successfully edited", { timeout: 30000 });
    },
  );

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
      cy.contains("Data Files", { timeout: 20000 }).click();
      cy.contains("jpg");
      cy.contains("Contact").click();
      cy.contains("Test Maintainer 2");
      cy.contains("test-maintainer-2@example.com");
      cy.contains("Test Maintainer 3");
      cy.contains("test-maintainer-3@example.com");
      cy.contains("Test Maintainer 1").should("not.exist");
      cy.contains("test-maintainer-1@example.com").should("not.exist");
    },
  );

  it(
    "Add a new datafile of type tilecache",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/dashboard/datasets/" + dataset + "/edit");
      cy.contains("Data Files", { timeout: 20000 }).click();
      cy.wait(5000);
      cy.get("button").contains("Add another Data File").click();
      cy.wait(500);
      cy.get(".datafile-accordion-trigger").eq(2).click();
      cy.get("#tile-cache-link-button").click();
      cy.get('input[name="resources.2.url"]').clear().type("https://google.com");
      cy.get('input[name="resources.2.title"]').clear().type("Tile cache");
      cy.contains("Select cache type").click();
      // NOTE: must target the dropdown option explicitly. A plain
      // cy.contains("Raster") matches the "Link to Data API Raster Tile Set"
      // tab first, which silently switches the resource type away from
      // tile-cache and breaks the save.
      cy.contains('[role="option"]', "Raster").click();
      cy.get("button").contains("Update Dataset").click();
      cy.contains("Successfully edited", { timeout: 30000 });
    },
  );

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
      cy.contains("Data Files", { timeout: 20000 }).click();
      cy.contains("Tile cache").click();
      cy.contains("https://google.com");
    },
  );

  it(
    "Add a new datafile of type gee asset",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/dashboard/datasets/" + dataset + "/edit");
      cy.contains("Data Files", { timeout: 20000 }).click();
      cy.wait(5000);
      cy.get("button").contains("Add another Data File").click();
      cy.wait(500);
      cy.get(".datafile-accordion-trigger").eq(3).click();
      cy.get("#gee-asset-button").click();
      cy.get('input[name="resources.3.asset_id"]').clear().type("gee asset id");
      cy.get('input[name="resources.3.title"]').clear().type("Gee asset");
      cy.contains("Select asset type").click();
      // NOTE: must target the dropdown option explicitly. A plain
      // cy.contains("Raster") matches the "Link to Data API Raster Tile Set"
      // tab first, which silently switches the resource type away from
      // gee-asset and breaks the save.
      cy.contains('[role="option"]', "Raster").click();
      cy.get("button").contains("Update Dataset").click();
      cy.contains("Successfully edited", { timeout: 30000 });
    },
  );

  it(
    "Should show the new asset id resource",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/datasets/" + dataset);
      cy.get("h1").contains(dataset + " EDITED", { timeout: 30000 });
      cy.contains("Data Files", { timeout: 20000 }).click();
      cy.contains("Gee asset").click();
      cy.contains("gee asset id");
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
    cy.deleteDatasetAPI(dataset);
    cy.deleteGroupAPI(topic);
    cy.deleteOrganizationAPI(org);
  });
});
