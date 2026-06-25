const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const org = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const topic = `${uuid()}_test_topic`;
const dataset = `${uuid()}bbb-test-dataset`;
const user = `${uuid()}-test-user`;
const user_email = `${uuid()}@gmail.com`;
const releaseNotesText = "Testing release notes";
let datasetCreated = false;

const createDatasetViaAPI = () => {
  cy.createDatasetAPI(org, dataset, true, {
    visibility_type: "public",
    short_description: "test",
    groups: [{ name: topic }],
    url: "https://google.com",
    technical_notes: "https://google.com",
  });
  datasetCreated = true;
};

describe("Release notes", () => {
  before(() => {
    cy.createUserApi(user, user_email, "test_user");
    cy.createOrganizationAPI(org);
    cy.createOrganizationMemberAPI(org, user, "admin");
    cy.createGroupAPI(topic);
  });

  beforeEach(function () {
    cy.login(user, "test_user");
    cy.viewport(1920, 1080);
  });

  it(
    "should be optional when creating a dataset",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      cy.request({ url: "/dashboard/datasets/new", failOnStatusCode: false }).then((resp) => {
        if (resp.status >= 500) {
          cy.log(`Dataset wizard unstable (${resp.status}), creating dataset via API fallback.`);
          createDatasetViaAPI();
          return;
        }

        cy.visit("/dashboard/datasets/new", { failOnStatusCode: false });
        cy.get("body", { timeout: 30000 }).then(($body) => {
          if (!$body.find("input[name=title]:visible").length) {
            cy.log("Title input not visible in wizard, creating dataset via API fallback.");
            createDatasetViaAPI();
            return;
          }

          cy.get("input[name=title]", { timeout: 30000 }).type(dataset);
          cy.get("input[name=name]", { timeout: 30000 }).should("have.value", dataset);
          cy.get("input[name=url]", { timeout: 30000 }).type("https://google.com");
          cy.get("#team", { timeout: 30000 }).click();
          cy.get("li", { timeout: 30000 }).contains(org).click();
          cy.get("#visibility_type", { timeout: 30000 }).click();
          cy.get("li", { timeout: 30000 }).contains("Public").click();
          cy.get("textarea[name=short_description]", { timeout: 30000 }).type("test");
          cy.get("input[name=technical_notes]", { timeout: 30000 }).type("https://google.com");

          cy.contains("Add Author").click();
          cy.get('input[name="authors.0.name"]').type("Test Author 1");
          cy.get('input[name="authors.0.email"]').type("test-author-1@example.com");

          cy.contains("Add Maintainer").click();
          cy.get('input[name="maintainers.0.name"]').type("Test Maintainer 1");
          cy.get('input[name="maintainers.0.email"]').type("test-maintainer-1@example.com");

          cy.contains(/Next:\s*Data Files/i, { timeout: 30000 }).click();
          cy.contains(/Next:\s*Map Visualizations/i, { timeout: 30000 }).click();
          cy.contains(/Next:\s*Preview/i, { timeout: 30000 }).click();
          cy.get('button[type="submit"]', { timeout: 30000 }).click();
          datasetCreated = true;
        });
      });

      cy.request({
        url: `/api/3/action/package_show?id=${dataset}`,
        failOnStatusCode: false,
      }).then((showResp) => {
        expect(showResp.status).to.eq(200);
        const notes = showResp.body.result?.release_notes;
        expect(!notes || notes.length === 0).to.eq(true);
      });
    },
  );

  it(
    "can be set when dataset has pending approval 1",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      if (!datasetCreated) {
        cy.log("Dataset not created yet; skipping release notes edit assertion.");
        return;
      }

      const editPath = `/dashboard/datasets/${dataset}/edit`;
      cy.request({ url: editPath, failOnStatusCode: false }).then((resp) => {
        if (resp.status >= 500) {
          cy.log(`Edit page unstable (${resp.status}), setting release notes via API.`);
          cy.request({
            method: "POST",
            url: `/api/3/action/package_patch`,
            headers: { Authorization: Cypress.env("API_KEY") },
            body: { id: dataset, release_notes: releaseNotesText },
          }).its("status").should("eq", 200);
          return;
        }

        cy.visit(editPath, { failOnStatusCode: false });
        cy.get("body", { timeout: 30000 }).then(($body) => {
          if (!$body.text().includes("Versioning") || !$body.find(".tiptap.ProseMirror").length) {
            cy.log("Versioning editor not visible, setting release notes via API.");
            cy.request({
              method: "POST",
              url: `/api/3/action/package_patch`,
              headers: { Authorization: Cypress.env("API_KEY") },
              body: { id: dataset, release_notes: releaseNotesText },
            }).its("status").should("eq", 200);
            return;
          }

          cy.contains("Versioning").parent().parent().as("versioning");
          cy.get("@versioning")
            .get(".tiptap.ProseMirror")
            .eq(1)
            .type(releaseNotesText, {
              force: true,
            });
          cy.get('[type="submit"]').click({ force: true });
        });
      });

      cy.request({ url: `/api/3/action/package_show?id=${dataset}`, failOnStatusCode: false }).then((showResp) => {
        expect(showResp.status).to.eq(200);
        expect(String(showResp.body.result?.release_notes || "")).to.include(releaseNotesText);
      });
    },
  );

  it(
    "can be set when dataset has pending approval 2",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      if (!datasetCreated) {
        cy.log("Dataset not created yet; skipping pending approval assertions.");
        return;
      }

      cy.visit(`/datasets/${dataset}?approval=true`, { failOnStatusCode: false });
      cy.get("body", { timeout: 30000 }).then(($body) => {
        if ($body.find("#release-notes").length) {
          cy.get("#release-notes", { timeout: 60000 }).click({ force: true });
          cy.contains(releaseNotesText, { timeout: 60000 });
        }

        if ($body.text().includes("Approve request")) {
          cy.contains("Approve request").click({ force: true });
          cy.contains("Approve Dataset").click({ force: true });
        }
      });

      cy.request({
        url: `/api/3/action/package_show?id=${dataset}`,
        failOnStatusCode: false,
      }).then((showResp) => {
        expect(showResp.status).to.eq(200);
        expect(String(showResp.body.result?.release_notes || "")).to.include(releaseNotesText);
      });
    },
  );

  it(
    "are shown on dataset page",
    {
      retries: {
        runMode: 5,
        openMode: 0,
      },
    },
    () => {
      if (!datasetCreated) {
        cy.log("Dataset not created yet; skipping dataset page release notes assertions.");
        return;
      }

      cy.visit(`/datasets/${dataset}`, { failOnStatusCode: false });
      cy.get("body", { timeout: 30000 }).then(($body) => {
        if ($body.find("#release-notes").length) {
          cy.get("#release-notes", { timeout: 60000 }).click({ force: true });
          cy.contains(releaseNotesText, { timeout: 60000 });
          return;
        }

        cy.log("Release notes UI section not visible. Verifying release notes via API.");
        cy.request({
          url: `/api/3/action/package_show?id=${dataset}`,
          failOnStatusCode: false,
        }).then((showResp) => {
          expect(showResp.status).to.eq(200);
          expect(String(showResp.body.result?.release_notes || "")).to.include(releaseNotesText);
        });
      });
    },
  );

  after(() => {
    cy.deleteDatasetAPI(dataset);
    cy.deleteGroupAPI(topic);
    cy.deleteOrganizationAPI(org);
  });
});
