const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const pages = require("../../routes.json");
const uuid = () => Math.random().toString(36).slice(2) + "-test";
const team = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}ttttopp${Cypress.env("DATASET_NAME_SUFFIX")}`;
const topic = `${uuid()}${Cypress.env("GROUP_SUFFIX")}`;
const datasetName2 = `${uuid()}ttttopp${Cypress.env("DATASET_NAME_SUFFIX")}`;

const replacements = {
  settings: {
    name: ckanUserName,
  },
  team: {
    name: team,
  },
  dataset: {
    name: datasetName,
  },
  topic: {
    name: topic,
  },
};

const replaceParams = (route) => {
  if (route.includes("<name>")) {
    for (const key in replacements) {
      if (route.includes(key)) {
        return route.replace("<name>", replacements[key].name);
      }
    }
  }
  return route;
};

describe("Pages meet the accessibility requirements onload ", () => {
  before(function () {
    cy.createOrganizationAPI(team);
    cy.createDatasetAPI(team, datasetName, true, {
      notes: "test",
      draft: "true",
      approval_status: "pending",
      short_description: "test",
      technical_notes: "https://source.com/stat",
      visibility_type: "public",
      authors: [{ name: "Stephen Oni", email: "stephenoni2@gmail.com" }],
      maintainers: [{ name: "Stephen", email: "stephenoni2@gmail.com" }],
      update_frequency: "hourly",
      is_approved: "false",
    });
    cy.fixture("airtravel.csv").then((fileContent) => {
      cy.createDatasetAPI(team, datasetName2, true, {
        resources: [
          {
            format: "CSV",
            name: "airtravel",
            description: "airtravel",
            upload: fileContent,
          },
        ],
      });
      cy.approvePendingDatasetAPI(datasetName);
      cy.approvePendingDatasetAPI(datasetName2);

      cy.createGroupAPI(topic);
    });
  });

  beforeEach(() => {
    cy.login(ckanUserName, ckanUserPassword);
  });

  let i = 0;
  let max = 1;

  pages.forEach((page) => {
    it(`${replaceParams(page)}`, () => {
      cy.visit(replaceParams(page), { timeout: 30000 });
      if (page.includes("edit")) {
        cy.wait(5000);
      }
      cy.injectAxe();
      cy.checkAccessibility();
    });
  });

  after(() => {
    cy.deleteDatasetAPI(datasetName);
    cy.deleteDatasetAPI(datasetName2);
    cy.deleteOrganizationAPI(team);
    cy.deleteGroupAPI(topic);
  });
});
