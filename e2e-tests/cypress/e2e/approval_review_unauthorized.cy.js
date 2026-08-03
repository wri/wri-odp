/**
 * Reveals: ?approval=true can show Approve/Reject without loading pending
 * diffs / yellow highlights / version toggle when the reviewer is not
 * authorized for the dataset's team (pendingExist stays false).
 *
 * This is the same code path as Dashboard → Requests for Approval → Review
 * (ApprovalRow links to /datasets/<name>?approval=true).
 *
 * Expected invariant (once fixed): Approve/Reject must not appear without
 * the change-review UI (#toggle-version / .bg-yellow-200). Either both are
 * present (authorized) or neither (unauthorized).
 */
const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");
const userSuffix = Cypress.env("USER_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const teamA = `${uuid()}${orgSuffix}`.toLowerCase();
const teamB = `${uuid()}${orgSuffix}`.toLowerCase();
const datasetName = `${uuid()}${datasetSuffix}`.toLowerCase();
const reviewer = `${uuid()}${userSuffix}_reviewer`.toLowerCase();
const reviewerEmail = `${uuid()}@example.com`;
const reviewerPassword = "test1234";

Cypress.on("uncaught:exception", (err) => {
  // Keep behavior consistent with cypress/support/e2e.js: ignore known 3rd-party
  // noise, but fail on real application errors.
  if (err.message.includes("Osano") || err.message.includes("Hotjar")) {
    return false;
  }
  return true;
});

describe("Approval Review without team authorization (?approval=true)", () => {
  before(() => {
    cy.createUserApi(reviewer, reviewerEmail, reviewerPassword);

    // Team A: reviewer is Admin (sees Requests for Approval via isOrgAdmin)
    cy.createOrganizationAPI(teamA);
    cy.createOrganizationMemberAPI(teamA, reviewer, "admin");

    // Team B: owns the pending dataset; reviewer is NOT a member
    cy.createOrganizationAPI(teamB);
    cy.createDatasetAPI(teamB, datasetName, true, {
      notes: "baseline notes",
      short_description: "baseline short description",
      technical_notes: "https://example.com/notes",
      visibility_type: "public",
      update_frequency: "hourly",
      authors: [{ name: "Author", email: "author@example.com" }],
      maintainers: [{ name: "Maintainer", email: "maintainer@example.com" }],
    });
  });

  after(() => {
    cy.deleteDatasetAPI(datasetName);
    cy.deleteOrganizationAPI(teamA);
    cy.deleteOrganizationAPI(teamB);
    cy.deleteUserApi(reviewer);
  });

  it(
    "creates a pending metadata revision on Team B dataset",
    {
      retries: { runMode: 3, openMode: 0 },
    },
    () => {
      cy.login(ckanUserName, ckanUserPassword);
      cy.viewport(1920, 1080);

      cy.visit(`/dashboard/datasets/${datasetName}/edit`);
      cy.get("input[name=title]", { timeout: 30000 })
        .clear()
        .type(`${datasetName} EDITED`);
      cy.get("textarea[name=short_description]")
        .clear()
        .type("changed short description for approval review");
      cy.get("button").contains("Update Dataset").click({ force: true });
      cy.contains(`Successfully edited the "${datasetName}" Dataset`, {
        timeout: 60000,
      });
    }
  );

  it(
    "control: authorized sysadmin sees Approve/Reject AND change highlights",
    {
      retries: { runMode: 3, openMode: 0 },
    },
    () => {
      cy.login(ckanUserName, ckanUserPassword);
      cy.viewport(1920, 1080);

      cy.visit(`/datasets/${datasetName}`);
      cy.contains("Approve request", { timeout: 60000 }).should("be.visible");
      cy.get("#toggle-version", { timeout: 30000 }).should("exist");
      cy.get(".bg-yellow-200", { timeout: 30000 }).should("exist");
    }
  );

  it(
    "reveals bug: Team A Admin visiting Team B dataset via ?approval=true sees Approve/Reject without change highlights",
    {
      retries: { runMode: 3, openMode: 0 },
    },
    () => {
      cy.logout();
      cy.login(reviewer, reviewerPassword);
      cy.viewport(1920, 1080);

      // Same URL the Review button builds in ApprovalRow
      cy.visit(`/datasets/${datasetName}?approval=true`);

      // Wait for the page (and optional approval bar) to settle
      cy.contains(datasetName, { timeout: 60000 });

cy.get("body", { timeout: 30000 }).should(($body) => {
  const hasApprove = $body.text().includes("Approve request");
  const hasToggle = $body.find("#toggle-version").length > 0;
  const hasYellowHighlight = $body.find(".bg-yellow-200").length > 0;

  expect(
    hasApprove,
    "Unauthorized user should not see 'Approve request' for a dataset owned by another team"
  ).to.eq(false);
  expect(hasToggle, "Unauthorized user should not see version toggle").to.eq(false);
  expect(hasYellowHighlight, "Unauthorized user should not see diff highlights").to.eq(false);
});
    }
  );
});
