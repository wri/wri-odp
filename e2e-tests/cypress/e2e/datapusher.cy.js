const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const dataset = `${uuid()}-test-datasettytytyty`;

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

    cy.contains("Next: Datafiles").click();
    cy.get("input[type=file]").selectFile("cypress/fixtures/cities.csv", {
      force: true,
    });
    cy.wait(5000);
    cy.contains("Next: Map Visualizations").click();
    cy.contains("Next: Preview").click();
    //FOR SOME REASON THIS SEEM NOT TO WORK 
    // IN CI/CD BUT WORKS LOCALLY
    //get button of type submit
    // cy.get('button[type="submit"]').click();
    // cy.contains(`Successfully created the "${dataset}" dataset`, {
    //   timeout: 20000,
    // });
    cy.get('button[type="submit"]').click();
    cy.wait(40000);
    cy.visit("/dashboard/datasets");
    cy.wait(15000)
    cy.contains("Awaiting Approval").click({ timeout: 15000 });
    cy.wait(20000)
    cy.get('input[type="search"]').type(dataset).type("{enter}");

    cy.contains("div", dataset).should("exist", { timeout: 15000 });
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
      cy.contains(`Successfully submited datafile to the datapusher`, {
        timeout: 15000,
      });
      cy.wait(15000);
      cy.contains("DATAPUSHER+ JOB DONE!", { timeout: 15000 });
    },
  );

  it("Edit metadata", () => {
    cy.visit("/dashboard/datasets/" + dataset + "/edit");
    cy.get("input[name=title]")
      .clear()
      .type(dataset + " EDITED");
    cy.get("textarea[name=short_description]").clear().type("test234");
    cy.get("button").contains("Update Dataset").click({force: true,});
     cy.wait(20000);
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
      cy.viewport(1440, 900);
      cy.wait(15000);
      cy.visit("/datasets/" + dataset);
      cy.get("#toggle-version").click();
      cy.wait(10000)
      // cy.contains("View Table Preview", { timeout: 30000 }).click();
      cy.contains("01D2539e270CEbd", { timeout: 15000 });
      cy.contains("Download Data").click();
      cy.get("#download-subset-csv").click();
      cy.wait(5000)
      cy.contains("Get via email")
    },
  );

  after(() => {
    cy.deleteDatasetAPI(dataset);
  });
});
