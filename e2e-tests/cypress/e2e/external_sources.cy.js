const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";
const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;

const geeDataset = `${uuid()}-gee-dataset`;
const arcgisDataset = `${uuid()}-arcgis-dataset`;
const cartoDataset = `${uuid()}-carto-dataset`;
const documentDataset = `${uuid()}-document-dataset`;

describe("External sources", () => {
  before(() => {
    cy.createOrganizationAPI(parentOrg);
    cy.createDatasetAPI(parentOrg, geeDataset, true, {
      rw_id: "eb410751-3c25-456b-abfb-7c965e55b91c",
      visibility_type: "public",
      is_approved: true,
      technical_notes: "http://google.com",
    });
    cy.createDatasetAPI(parentOrg, arcgisDataset, true, {
      rw_id: "395bf8ae-7c4c-4536-b866-2ac92ffea0ce",
      visibility_type: "public",
      is_approved: true,
      technical_notes: "http://google.com",
    });
    cy.createDatasetAPI(parentOrg, cartoDataset, true, {
      rw_id: "92fe644d-748c-44a7-a20f-534d5ea6d7de",
      visibility_type: "public",
      is_approved: true,
      technical_notes: "http://google.com",
    });
    cy.createDatasetAPI(parentOrg, documentDataset, true, {
      rw_id: "3feaf26c-42c8-43ce-b1b5-07a02a773c36",
      visibility_type: "public",
      is_approved: true,
      technical_notes: "http://google.com",
    });
  });

  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it(
    "should render gee dataset",
    () => {
      cy.visit(`/datasets/${geeDataset}`);
      cy.contains('Open in GEE')
    },
  );
  it(
    "should render arcgis dataset",
    () => {
      cy.visit(`/datasets/${arcgisDataset}`);
      cy.contains('Open in ArcGIS')
    },
  );
  it(
    "should render carto dataset",
    () => {
      cy.visit(`/datasets/${cartoDataset}`);
      cy.contains('Open in Carto')
    },
  );
  it(
    "should render document dataset",
    () => {
      cy.visit(`/datasets/${documentDataset}`);
      cy.contains('Open external sources').click()
      cy.contains('Source 1')
    },
  );
  after(() => {
    cy.deleteDatasetAPI('gee-dataset');
    cy.deleteDatasetAPI('arcgis-dataset');
    cy.deleteDatasetAPI('carto-dataset');
    cy.deleteDatasetAPI('document-dataset');
    cy.deleteOrganizationAPI(parentOrg);
  });
});
