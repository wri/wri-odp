const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const dataset = `${uuid()}-test-dataset`;

describe("Upload file and create dataset", () => {
  beforeEach(function () {
    cy.login('ckan_admin', 'test1234');
  });

  it("Should create dataset", () => {
    cy.visit("/dashboard/datasets/new");
    cy.get("input[name=title]").type(dataset);
    cy.get("input[name=name]").should("have.value", dataset);
    cy.get("#visibility_type").click();
    cy.get("li").contains("Public").click();
    cy.get("input[name=technical_notes]").type("https://google.com");
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
    cy.contains("Next: Preview").click();
    //get button of type submit
    cy.get('button[type="submit"]').click();
    cy.contains(`Successfully created the "${dataset}" dataset`, {
      timeout: 15000,
    });
    cy.wait(20000);
  });

  it(
    "Submit datapusher",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/dashboard/datasets/" + dataset + "/edit");
      cy.contains("Data Files").click();
      cy.contains("Datapusher").click();
      cy.contains("Submit to Datapusher").click();
      cy.contains(`Successfully submited resource to the datapusher`, {
        timeout: 15000,
      });
      cy.wait(15000);
      cy.contains("Finished in state Completed", { timeout: 15000 });
    },
  );

  it(
    "Should show the tabular preview",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.viewport(1440, 900);
      cy.wait(15000);
      cy.visit("/datasets/" + dataset);
      cy.reload(true);
      cy.contains("Add Tabular View", { timeout: 30000 }).click();
      cy.contains("01D2539e270CEbd", { timeout: 15000 });
    },
  );

  after(() => {
    cy.deleteDatasetAPI(dataset);
  });
});
