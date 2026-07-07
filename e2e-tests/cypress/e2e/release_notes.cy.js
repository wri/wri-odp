const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";
const apiUrl = (path) =>
  `${Cypress.config().apiUrl}/api/3/action/${path}`;

const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const topic = `${uuid()}_test_topic`;
const dataset = `${uuid()}bbb-test-dataset`;
const user = `${uuid()}-test-user`;
const user_email = `${uuid()}@gmail.com`;

const createReleaseNotesDataset = () => {
  cy.visit("/dashboard/datasets/new");
  cy.get("input[name=title]").type(dataset);
  cy.get("input[name=name]").should("have.value", dataset);
  cy.get("input[name=url]").type("https://google.com");
  cy.get("#team").click();
  cy.contains('[role="option"]', org).click();
  cy.get("#visibility_type").click();
  cy.contains('[role="option"]', "Public").click();
  cy.get("textarea[name=short_description]").type("test");

  cy.get("input[name=technical_notes]").type("https://google.com");

  cy.contains("Add Author").click();
  cy.get('input[name="authors.0.name"]').type("Test Author 1");
  cy.get('input[name="authors.0.email"]').type("test-author-1@example.com");
  cy.contains("Add Author").click();
  cy.get('input[name="authors.1.name"]').type("Test Author 2");
  cy.get('input[name="authors.1.email"]').type("test-author-2@example.com");

  cy.contains("Add Maintainer").click();
  cy.get('input[name="maintainers.0.name"]').type("Test Maintainer 1");
  cy.get('input[name="maintainers.0.email"]').type(
    "test-maintainer-1@example.com",
  );
  cy.contains("Add Maintainer").click();
  cy.get('input[name="maintainers.1.name"]').type("Test Maintainer 2");
  cy.get('input[name="maintainers.1.email"]').type(
    "test-maintainer-2@example.com",
  );

  cy.contains("Next: Data Files").click();
  cy.contains("Next: Map Visualizations").click();
  cy.contains("Next: Preview").click();
  cy.get('button[type="submit"]').click();
  cy.contains(dataset, { timeout: 30000 });
};

describe("Release notes", () => {
  before(() => {
    cy.createUserApi(user, user_email, "test_user");
    cy.createOrganizationAPI(org);
    cy.createOrganizationMemberAPI(org, user, "admin");
    cy.createGroupAPI(topic);
    cy.login(user, "test_user");
    cy.request({
      method: "POST",
      url: apiUrl("package_show"),
      headers: { Authorization: Cypress.env("API_KEY") },
      body: { id: dataset },
      failOnStatusCode: false,
    }).then((response) => {
      if (!response.body.success) {
        createReleaseNotesDataset();
      }
    });
  });

  beforeEach(function () {
    cy.login(user, "test_user");
    cy.viewport(1920, 1080);
  });

  it(
    "should be optional when creating a dataset",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visitDatasetPage(dataset, { waitForTabs: false });
      cy.openDatasetTab("release-notes");
      cy.contains("This Dataset is at its initial version", {
        timeout: 60000,
      }).should("be.visible");
    },
  );

  it(
    "can be set when dataset has pending approval 1",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/dashboard/datasets/${dataset}/edit`);
      cy.contains("Versioning").parent().parent().as("versioning");
      cy.get("@versioning")
        .get(".tiptap.ProseMirror")
        .eq(1)
        .type("Testing release notes", {
          force: true,
        });
      cy.get('[type="submit"]').click({ force: true });
      cy.contains(`Successfully edited the "${dataset}" Dataset`, {
        timeout: 30000,
      });
    },
  );

  it(
    "can be set when dataset has pending approval 2",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visitDatasetPage(dataset, {
        query: "approval=true",
        waitForTabs: false,
        waitForToggle: true,
      });
      cy.openDatasetTab("release-notes");
      cy.contains("h3", "Pending", { timeout: 60000 }).should("be.visible");
      cy.get(".prose", { timeout: 60000 })
        .contains("Testing release notes")
        .should("be.visible");
      cy.contains("Approve request").click({ force: true });
      cy.contains("Approve Dataset").click({ force: true });
      cy.wait(5000);
    },
  );

  it(
    "are shown on dataset page",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visitDatasetPage(dataset, { waitForTabs: false });
      cy.openDatasetTab("release-notes");
      cy.get(".prose", { timeout: 60000 })
        .contains("Testing release notes")
        .should("be.visible");
    },
  );

  after(() => {
    cy.deleteDatasetAPI(dataset);
    cy.deleteGroupAPI(topic);
    cy.deleteOrganizationAPI(org);
  });
});
