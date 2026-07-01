const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;

const parentOrg2 = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const org2 = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName2 = `${uuid()}${Cypress.env("DATASET_NAME_SUFFIX")}`;

const group = `${uuid()}${Cypress.env("GROUP_SUFFIX")}`;

describe("Map view", () => {
  before(() => {
    cy.createGroupAPI(group);

    cy.createOrganizationAPI(parentOrg);
    cy.createDatasetAPI(parentOrg, datasetName, true, {
      groups: [{ name: group }],
      visibility_type: "private",
      resources: [
        {
          name: "Layer 1",
          format: "Layer",
          rw_id: "9febfc3c-e425-4089-8c9e-bf0da54a7bf6",
          url: "https://api.resourcewatch.org/v1/dataset/9b8e120e-046d-45c3-91d2-a8c30b8ebbc8/layer/9febfc3c-e425-4089-8c9e-bf0da54a7bf6",
        },
      ],
    });

    cy.createOrganizationAPI(parentOrg2);
    cy.createDatasetAPI(parentOrg2, datasetName2, true, {
      groups: [{ name: group }],
      visibility_type: "private",
      resources: [
        {
          name: "Layer 2",
          format: "Layer",
          rw_id: "3c4225a4-a8d8-4d73-b12d-0c47dec84c76",
          url: "https://api.resourcewatch.org/v1/layer/3c4225a4-a8d8-4d73-b12d-0c47dec84c76",
        },
      ],
    });
  });

  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it(
    "should render initial layer",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/datasets/${datasetName}`);

      cy.get(".vizzuality__c-legend-map", { timeout: 60000 }).contains(
        "2015 Human Development Index",
        { timeout: 60000 },
      );
    },
  );

  it(
    "should support multiple legend configs for a layer",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.visit(`/datasets/${datasetName}`);

      cy.get(".vizzuality__c-legend-map .vizzuality__legend-info > div", {
        timeout: 60000,
      }).should("have.length", 2);
    },
  );

  //  it(
  //    "should allow to add layers from related datasets",
  //    {
  //      retries: {
  //        runMode: 5,
  //        openMode: 0,
  //      },
  //    },
  //    () => {
  //      cy.visit(`/datasets/${datasetName}`);
  //      cy.contains("Related Datasets").click({ force: true });
  //      cy.contains(datasetName2);
  //      cy.contains("Add to map").click();
  //      cy.contains("Layer 2").click();
  //      cy.wait(2000);
  //      cy.get("#add-to-map-modal-btn").click();
  //
  //      cy.get(".vizzuality__c-legend-map", { timeout: 60000 }).contains(
  //        "Tree cover loss - 2001-2022",
  //        { timeout: 60000 },
  //      );
  //    },
  //  );

  after(() => {
    cy.deleteDatasetAPI(datasetName);
    cy.deleteOrganizationAPI(parentOrg);
  });
});
