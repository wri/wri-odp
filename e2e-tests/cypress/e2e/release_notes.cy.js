const uuid = () => Math.random().toString(36).slice(2) + "-test";

const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const topic = `${uuid()}_test_topic`;
const dataset = `${uuid()}bbb-test-dataset`;
const user = `${uuid()}-test-user`;
const user_email = `${uuid()}@gmail.com`;

describe("Release notes", () => {
  before(() => {
    cy.createUserApi(user, user_email, "test_user");
    cy.createOrganizationAPI(org);
    cy.createOrganizationMemberAPI(org, user, "admin");
    cy.createGroupAPI(topic);
  });

  beforeEach(function () {
    cy.login(user, "test_user");
    cy.viewport(1920, 1080);
  });

  it(
    "should be optional when creating a dataset",
    {
      retries: {
        runMode: 2,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/dashboard/datasets/new");
      cy.get("input[name=title]").type(dataset);
      cy.get("input[name=name]").should("have.value", dataset);
      cy.get("#team", { timeout: 15000 }).should("be.visible").click();
      cy.get('[role="listbox"]').should("be.visible");
      cy.contains('[role="option"]', org).click();
      cy.get("#team").should("contain.text", org);
      cy.get("#visibility_type").click();
      cy.contains('[role="option"]', "Public").click();
      cy.get("textarea[name=short_description]").type("test");
      cy.contains("Description")
        .parent()
        .parent()
        .find(".tiptap.ProseMirror")
        .type("RICH TEXT EDITOR");

      cy.contains("Methodology").click();
      cy.get("input[name=technical_notes]").type("https://google.com");

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

      cy.contains("Next: Data Files").click();
      cy.get(".datafile-accordion-trigger").eq(0).click();
      cy.get("input[type=file]")
        .eq(0)
        .selectFile("cypress/fixtures/airtravel.csv", {
          force: true,
        });
      cy.contains("Next: Map Visualizations").click();
      cy.contains("Next: Preview").click();
      cy.get('button[type="submit"]').click();
      cy.contains(`Successfully created the "${dataset}" Dataset`, {
        timeout: 20000,
      });

      cy.visit(`/datasets/${dataset}`);
      cy.get("#release-notes", { timeout: 10000 }).click({ force: true });
      cy.contains("This Dataset is at its initial version");
    },
  );

  it(
    "can be set when dataset has pending approval 1",
    {
      retries: {
        runMode: 2,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/dashboard/datasets/${dataset}/edit`);
      cy.contains("Add another release note", { timeout: 15000 }).click();
      cy.get('input[name="release_notes_items.0.date"]').type("2026-08-31");
      cy.get('textarea[name="release_notes_items.0.note"]').type("Testing release notes");
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
        runMode: 2,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/datasets/${dataset}?approval=true`);
      cy.get("#release-notes", { timeout: 60000 }).click({ force: true });
      cy.contains("Testing release notes", { timeout: 60000 });
      cy.contains("Approve request").click({ force: true });
      cy.contains("button", "Approve Dataset", { timeout: 15000 }).click({
        force: true,
      });
      // Outcome verified by the following "are shown on dataset page" test.
    },
  );

  it(
    "are shown on dataset page",
    {
      retries: {
        runMode: 2,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/datasets/${dataset}`);
      cy.get("#release-notes", { timeout: 60000 }).click({ force: true });
      cy.contains("Testing release notes", { timeout: 60000 });
    },
  );

  after(() => {
    const api = `${Cypress.config().apiUrl}/api/3/action`;
    const headers = { Authorization: Cypress.env("API_KEY") };
    cy.request({
      method: "POST",
      url: `${api}/package_delete`,
      headers,
      body: { id: dataset },
      failOnStatusCode: false,
    });
    cy.request({
      method: "POST",
      url: `${api}/group_delete`,
      headers,
      body: { id: topic },
      failOnStatusCode: false,
    });
    cy.request({
      method: "POST",
      url: `${api}/organization_delete`,
      headers,
      body: { id: org },
      failOnStatusCode: false,
    });
  });
});
