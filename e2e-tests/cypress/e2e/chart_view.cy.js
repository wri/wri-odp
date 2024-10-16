const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;

describe("Chart view", () => {
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Should create dataset", () => {
    cy.visit("/dashboard/datasets/new");
    cy.get("input[name=title]").type(datasetName);
    cy.get("input[name=name]").should("have.value", datasetName);
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
    cy.get('.datafile-accordion-trigger').eq(0).click()
    cy.get("input[type=file]").eq(0).selectFile("cypress/fixtures/airtravel.csv", {
      force: true,
    });
    cy.wait(5000);
    cy.contains("Next: Map Visualizations").click();
    cy.contains("Next: Preview").click();
    cy.get('button[form="create_dataset_form"]').click();
    cy.contains(`Successfully created the "${datasetName}" dataset`, {
      timeout: 20000,
    });
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
      cy.visit("/dashboard/datasets/" + datasetName + "/edit");
      cy.contains("Data Files").click();
      cy.get('.datafile-accordion-trigger').eq(0).click()
      cy.contains("Datapusher").click();
      cy.contains("Submit to Datapusher").click();
      cy.contains(`Successfully submited datafile to the datapusher`, {
        timeout: 15000,
      });
      cy.wait(30000);
      cy.contains("DATAPUSHER+ JOB DONE!", { timeout: 15000 });
    },
  );

  it(
    "should be creatable from the UI",
    {
      retries: {
        runMode: 10,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/dashboard/datasets/${datasetName}/edit`);

      cy.contains("Data Files", { timeout: 20000 }).click({ force: true });

      cy.wait(9000)
      cy.get(".views-tab").click();

      cy.contains("Add a view").click();

      cy.get(".chart-popup-item").click();

      cy.contains("Add a chart view", { timeout: 40000 })
        .parent()
        .as("chart-container");

      cy.get('[name="title"]').type("This is my new chart");

      cy.get("@chart-container").contains("Data").click({ force: true });

      cy.get("@chart-container").get("#dimension").click({ force: true });
      cy.wait(500)
      cy.get("@chart-container").contains("Month").click({ force: true });
      cy.wait(500)
      cy.get("@chart-container").get("#measure").click({ force: true });
      cy.wait(500)
      cy.get("@chart-container").contains("1958").click({ force: true });

      cy.get("@chart-container")
        .contains("Update Preview")
        .click({ force: true, timeout: "60000" });

      cy.wait(5000)

      cy.get("@chart-container")
        .contains("Add to Views")
        .click({ force: true, timeout: "60000" });

      cy.contains("successfully", { timeout: 30000 });

      cy.visit(`/dashboard/datasets/${datasetName}/edit`);

      cy.contains("Data Files", { timeout: 20000 }).click({ force: true });

      cy.get(".views-tab").click();

      cy.contains("This is my new chart");
    },
  );

  it(
    "should be editable from the UI",
    {
      retries: {
        runMode: 10,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/dashboard/datasets/${datasetName}/edit`);

      cy.contains("Data Files", { timeout: 20000 }).click({ force: true });

      cy.get(".views-tab").click();

      cy.contains("This is my new chart").click({ force: true });

      cy.contains("Edit the chart view", { timeout: 40000 })
        .parent()
        .as("chart-container");

      cy.get('[name="title"]').clear().type("This is my awesome chart");

      cy.get("@chart-container")
        .contains("Update Preview")
        .click({ force: true, timeout: "90000" });

      cy.wait(6000)
      cy.get("@chart-container")
        .contains("Update View")
        .click({ force: true, timeout: "90000" });
      cy.wait(40000)
      cy.visit(`/dashboard/datasets/${datasetName}/edit`);

      cy.contains("Data Files", { timeout: 20000 }).click({ force: true });

      cy.get(".views-tab").click();

      cy.contains("This is my awesome chart");
    },
  );

  it(
    "should be accessible throught the dataset page",
    {
      retries: {
        runMode: 10,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/datasets/${datasetName}`);

      cy.contains("View Chart Preview").click({ force: true });
      cy.wait(15000)
      cy.contains("This is my awesome chart")
    },
  );
});
