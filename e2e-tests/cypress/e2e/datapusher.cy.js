const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const uuid = () => Math.random().toString(36).slice(2) + "-test";
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const dataset = `${uuid()}-test-datasettytytyty`;

describe("Upload file and create dataset", () => {
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  before(() => {
    cy.createOrganizationAPI(org);
  });

  it(
    "Should create dataset",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
    cy.visit("/dashboard/datasets/new");
    cy.contains("h1", "Add a Dataset", { timeout: 30000 }).should("be.visible");

    cy.get('input[name="title"], input[placeholder="My Dataset"]', {
      timeout: 20000,
    })
      .first()
      .type(dataset);
    cy.get('input[name="name"], input[placeholder="name-of-dataset"]', {
      timeout: 10000,
    })
      .first()
      .should("have.value", dataset);
    cy.get("#visibility_type").click();
    cy.get("li").contains("Public").click();
    cy.get("#team").click();
    cy.contains("li", org, { timeout: 20000 }).click();
    cy.get("input[name=technical_notes]").type("https://google.com");
    cy.get('textarea[name="short_description"], textarea[aria-label="Short Description"]', {
      timeout: 10000,
    })
      .first()
      .type("test");

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
    cy.get(".datafile-accordion-trigger").eq(0).click();
    cy.get("input[type=file]").selectFile("cypress/fixtures/cities.csv", {
      force: true,
    });
    cy.wait(5000);
    cy.contains("Next: Map Visualizations").click();
    cy.contains("Next: Preview").click();
    cy.get('button[type="submit"]', { timeout: 20000 }).click();
    cy.contains(new RegExp(`Successfully created the "${dataset}"`, "i"), {
      timeout: 60000,
    }).should("be.visible");

    cy.visit("/dashboard/datasets");
    cy.get('input[type="search"]', { timeout: 30000 }).type(dataset).type("{enter}");

    cy.contains(dataset, { timeout: 30000 }).should("exist");
    },
  );

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
      cy.contains("Data Files", { timeout: 30000 }).click();
      cy.get(".datafile-accordion-trigger").eq(0).click();
      cy.contains("Datapusher").click();
      cy.contains("Submit to Datapusher", { timeout: 50000 }).click();
      cy.contains(/Successfully.*Data File.*datapusher/i, {
        timeout: 30000,
      });
      cy.contains(/DATAPUSHER\+ JOB DONE!/i, { timeout: 120000 });
    },
  );

  it("Edit metadata", () => {
    cy.visit("/dashboard/datasets/" + dataset + "/edit");
    cy.get('input[name="title"], input[placeholder="My Dataset"]', {
      timeout: 30000,
    })
      .first()
      .clear()
      .type(dataset + " EDITED");
    cy.get('textarea[name="short_description"], textarea[aria-label="Short Description"]', {
      timeout: 10000,
    })
      .first()
      .clear()
      .type("test234");
    cy.get("button").contains("Update Dataset").click({ force: true });
    cy.contains(/Dataset Updated|Successfully updated/i, { timeout: 30000 }).should(
      "exist",
    );
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
      cy.visit("/datasets/" + dataset);

      cy.get("body", { timeout: 30000 }).then(($body) => {
        if ($body.find("#toggle-version").length) {
          cy.get("#toggle-version").click({ force: true });
        }
      });

      cy.contains("01D2539e270CEbd", { timeout: 60000 });
      cy.contains("Download Data").click();
      cy.get("#download-subset-csv", { timeout: 30000 }).click();
      cy.contains("Submit");
    },
  );

  after(() => {
    cy.deleteDatasetAPI(dataset);
  });
});
