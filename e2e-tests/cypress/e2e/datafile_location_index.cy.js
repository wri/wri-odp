const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;

describe("Data File location", () => {
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  before(() => {
    cy.createOrganizationAPI(org);
  });

  it(
    "can be specified when creating a new data file and viewed on the dataset",
    {
      retries: {
        runMode: 2,
        openMode: 0,
      },
    },
    () => {
      cy.intercept("**/geocoding/**").as("geocode");

      cy.visit("/dashboard/datasets/new");
      cy.get("input[name=title]").type(datasetName);
      cy.get("input[name=name]").should("have.value", datasetName);
      cy.get("textarea[name=short_description]").type("test");

      cy.get("#team").click();
      cy.get('[role="listbox"]').should("be.visible");
      cy.contains('[role="option"]', org).click();
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
      cy.get("input[type=file]").selectFile("cypress/fixtures/airtravel.csv", {
        force: true,
      });
      cy.contains("Choose location").click({ force: true });

      // Mapbox Geocoder is debounce + suggestion list; assert selection via input
      // value (dropdown text disappears after pick — cy.contains("Brazil") flakes).
      cy.get(".mapboxgl-ctrl-geocoder--input", { timeout: 30000 })
        .should("be.visible")
        .clear()
        .type("Brazil", { delay: 80 });
      cy.wait("@geocode", { timeout: 30000 });
      cy.get(".mapboxgl-ctrl-geocoder--suggestion-title", { timeout: 15000 })
        .contains(/Brazil/i)
        .first()
        .click({ force: true });
      cy.get(".mapboxgl-ctrl-geocoder--input", { timeout: 15000 })
        .invoke("val")
        .should("match", /Brazil/i);

      cy.contains("Next: Map Visualizations").click();
      cy.contains("Next: Preview").click();
      cy.get('button[type="submit"]').click();
      cy.contains(`Successfully created the "${datasetName}" Dataset`, {
        timeout: 20000,
      });

      cy.visit(`/datasets/${datasetName}`);
      cy.contains(/Brazil/i, { timeout: 20000 });
    },
  );

  after(() => {
    const api = `${Cypress.config().apiUrl}/api/3/action`;
    const headers = { Authorization: Cypress.env("API_KEY") };
    cy.request({
      method: "POST",
      url: `${api}/package_delete`,
      headers,
      body: { id: datasetName },
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
