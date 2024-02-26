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
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/dashboard/datasets/new");
      cy.get("input[name=title]").type(dataset);
      cy.get("input[name=name]").should("have.value", dataset);
      cy.get("input[name=url]").type("https://google.com");
      cy.get("#visibility_type").click();
      cy.get("li").contains("Public").click();
      cy.get("textarea[name=short_description]").type("test");

      cy.get("input[name=technical_notes]").type("https://google.com");
      cy.get("input[name=author]").type("Luccas");
      cy.get("input[name=author_email]").type("luccasmmg@gmail.com");
      cy.get("input[name=maintainer]").type("Luccas");
      cy.get("input[name=maintainer_email]").type("luccasmmg@gmail.com");

      cy.contains("Next: Datafiles").click();
      cy.contains("Next: Map Visualizations").click();
      cy.contains("Next: Preview").click();
      cy.get('button[type="submit"]').click();
      cy.wait(5000);
      cy.contains(dataset);

      cy.visit(`/datasets/${dataset}`);
      cy.contains("Release Notes", { timeout: 60000 }).click({ force: true });
      cy.contains("This dataset is at it's initial version");
    },
  );

  it(
    "can be set when dataset has pending approval",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/dashboard/datasets/${dataset}/edit`);
      cy.contains("Versioning").parent().parent().as("versioning")
      cy.get("@versioning").get(".tiptap.ProseMirror").eq(1).type("Testing release notes", {
        force: true,
      });
      cy.get('[type="submit"]').click({ force: true });

      cy.wait(5000);

      cy.visit(`/datasets/${dataset}?approval=true`);
      cy.contains("Release Notes", { timeout: 60000 }).click({ force: true });
      cy.contains("Pending");
      cy.contains("Testing release notes");

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
      cy.visit(`/datasets/${dataset}`);
      cy.contains("Release Notes", { timeout: 60000 }).click({ force: true });
      cy.contains("Testing release notes");
    },
  );

  after(() => {
    cy.deleteOrganizationAPI(org);
    cy.deleteGroupAPI(topic);
    cy.deleteDatasetAPI(dataset);
  });
});
