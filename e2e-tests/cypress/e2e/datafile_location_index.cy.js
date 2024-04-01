const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;

describe("Data file location", () => {
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it(
    "can be specified when creating a new data file",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit("/dashboard/datasets/new");
      cy.get("input[name=title]").type(datasetName);
      cy.get("input[name=name]").should("have.value", datasetName);
      cy.get("textarea[name=short_description]").type("test");
      cy.get("input[name=author]").type("Luccas");
      cy.get("input[name=author_email]").type("luccasmmg@gmail.com");
      cy.get("input[name=maintainer]").type("Luccas");
      cy.get("input[name=maintainer_email]").type("luccasmmg@gmail.com");
      cy.contains("Next: Datafiles").click();
      cy.get("input[type=file]").selectFile("cypress/fixtures/airtravel.csv", {
        force: true,
      });
      cy.contains("Choose location").click({ force: true });
      cy.get(".mapboxgl-ctrl-geocoder--input").type("Brazil");
      cy.get(".mapboxgl-ctrl-geocoder--suggestion-title").first().click();
      cy.wait(5000);
      cy.contains("Next: Map Visualizations").click();
      cy.contains("Next: Preview").click();
      cy.get('button[type="submit"]').click();
      cy.contains(`Successfully created the "${datasetName}" dataset`, {
        timeout: 20000,
      });
    },
  );

  it(
    "can be viewed on the data files section for a dataset",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/datasets/${datasetName}`);
      cy.contains("Brazil");
    },
  );
});
