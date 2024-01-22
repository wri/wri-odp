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
const user_2 = `${uuid()}-test-user`;
const user_email_2 = `${uuid()}@gmail.com`;

describe("Upload file and create dataset", () => {
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Should create dataset", () => {
    cy.visit("/dashboard/datasets/new");
    cy.get("input[name=title]").type(dataset);
    cy.get("input[name=name]").should("have.value", dataset);
    cy.get("textarea[name=short_description]").type("test");
    cy.get("input[name=author]").type("Luccas");
    cy.get("input[name=author_email]").type("luccasmmg@gmail.com");
    cy.get("input[name=maintainer]").type("Luccas");
    cy.get("input[name=maintainer_email]").type("luccasmmg@gmail.com");
    cy.contains("Open In").click();
    cy.contains("Next: Datafiles").click();
    cy.get("input[type=file]").selectFile("cypress/fixtures/cities.csv", {
      force: true,
    });
    cy.wait(5000);
    cy.contans("Next: Preview").click();
    //get button of type submit
    cy.get('button[type="submit"]').click();
    cy.contains(`Successfully created the "${dataset}" dataset`, {
      timeout: 15000,
    });
  });

  it(
    "Should show the tabular preview",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.wait(15000);
      cy.visit("/datasets/" + dataset);
      cy.contains("Add Tabular View", { timeout: 30000 }).click();
      cy.contains('01D2539e270CEbd', { timeout: 15000 });
    },
  );

 after(() => {
    cy.deleteDatasetAPI(dataset);
  });
});
