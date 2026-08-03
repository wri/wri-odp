/**
 * Unauthorized Team Admin must not get a partial approval UI.
 *
 * Same URL as Dashboard → Requests for Approval → Review
 * (`/datasets/<name>?approval=true`).
 *
 * Invariant: Approve/Reject and change-review UI (#toggle-version /
 * .bg-yellow-200) stay in sync — both for authorized reviewers, neither
 * for unauthorized ones. Bare ?approval=true must not unlock the bar.
 */
const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");
const userSuffix = Cypress.env("USER_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const teamA = `${uuid()}${orgSuffix}`.toLowerCase();
const teamB = `${uuid()}${orgSuffix}`.toLowerCase();
/** Pending dataset owned by Team A — Team A Admin is authorized */
const teamADatasetName = `${uuid()}${datasetSuffix}`.toLowerCase();
/** Pending dataset owned by Team B — Team A Admin is NOT authorized */
const teamBDatasetName = `${uuid()}${datasetSuffix}`.toLowerCase();
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

/** Create approved public dataset then a pending metadata revision with a visible diff. */
function createApprovedDatasetWithPendingRevision(orgName, datasetName) {
  cy.createDatasetAPI(orgName, datasetName, true, {
    notes: "baseline notes",
    short_description: "baseline short description",
    technical_notes: "https://example.com/notes",
    visibility_type: "public",
    update_frequency: "hourly",
    authors: [{ name: "Author", email: "author@example.com" }],
    maintainers: [{ name: "Maintainer", email: "maintainer@example.com" }],
  });
  // WRI package_create always inserts a pending row equal to the package for
  // public datasets. Approve first so we have a clean approved baseline;
  // otherwise pending_dataset_create hits PK conflict and returns the old
  // identical pending → empty pending_diff_show.
  cy.approvePendingDatasetAPI(datasetName);

  // Same path as frontend editDataset: old_package_patch + pending_dataset_create.
  // Do NOT use package_patch — WRI's wrapper crashes activity dictize.
  cy.datasetMetadata(datasetName).then((dataset) => {
    cy.request({
      method: "POST",
      url: `${Cypress.config().apiUrl}/api/3/action/old_package_patch`,
      headers: { Authorization: Cypress.env("API_KEY") },
      body: {
        id: dataset.id,
        approval_status: "pending",
      },
    })
      .its("body.success")
      .should("eq", true);

    cy.request({
      method: "POST",
      url: `${Cypress.config().apiUrl}/api/3/action/pending_dataset_create`,
      headers: { Authorization: Cypress.env("API_KEY") },
      body: {
        package_id: dataset.id,
        package_data: {
          ...dataset,
          title: `${dataset.title || dataset.name} EDITED`,
          short_description: "changed short description for approval review",
          approval_status: "pending",
          is_approved: false,
          is_pending: true,
        },
      },
    })
      .its("body.success")
      .should("eq", true);

    cy.request({
      method: "GET",
      url: `${Cypress.config().apiUrl}/api/3/action/pending_diff_show?package_id=${dataset.id}`,
      headers: { Authorization: Cypress.env("API_KEY") },
    }).then((res) => {
      expect(res.body.success, JSON.stringify(res.body.error || {})).to.eq(
        true
      );
      expect(
        Object.keys(res.body.result?.diff || {}),
        "pending_diff_show should include title/short_description changes"
      ).to.have.length.greaterThan(0);
    });
  });
}

function assertFullApprovalReviewUi() {
  cy.contains("Approve request", { timeout: 15000 }).should("be.visible");
  cy.get("#toggle-version", { timeout: 15000 }).should("exist");
  cy.get(".bg-yellow-200", { timeout: 15000 }).should("exist");
}

describe("Approval Review without team authorization (?approval=true)", () => {
  before(() => {
    cy.createUserApi(reviewer, reviewerEmail, reviewerPassword);

    // Team A: reviewer is Admin (authorized for Team A datasets)
    cy.createOrganizationAPI(teamA);
    cy.createOrganizationMemberAPI(teamA, reviewer, "admin");
    createApprovedDatasetWithPendingRevision(teamA, teamADatasetName);

    // Team B: owns a pending dataset; reviewer is NOT a member
    cy.createOrganizationAPI(teamB);
    createApprovedDatasetWithPendingRevision(teamB, teamBDatasetName);
  });

  after(() => {
    cy.deleteDatasetAPI(teamADatasetName);
    cy.deleteDatasetAPI(teamBDatasetName);
    cy.deleteOrganizationAPI(teamA);
    cy.deleteOrganizationAPI(teamB);
    cy.deleteUserApi(reviewer);
  });

  it(
    "control: authorized sysadmin sees Approve/Reject AND change highlights on Team B dataset",
    {
      retries: { runMode: 3, openMode: 0 },
    },
    () => {
      cy.login(ckanUserName, ckanUserPassword);
      cy.viewport(1920, 1080);

      cy.visit(`/datasets/${teamBDatasetName}`);
      assertFullApprovalReviewUi();
    }
  );

  it(
    "control: Team A Admin sees Approve/Reject AND change highlights on Team A dataset",
    {
      retries: { runMode: 3, openMode: 0 },
    },
    () => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.login(reviewer, reviewerPassword);
      cy.viewport(1920, 1080);

      cy.visit(`/datasets/${teamADatasetName}?approval=true`);
      assertFullApprovalReviewUi();
    }
  );

  it(
    "Team A Admin on Team B dataset via ?approval=true gets neither Approve/Reject nor change highlights",
    {
      retries: { runMode: 3, openMode: 0 },
    },
    () => {
      // Clear session without UI signOut (NEXTAUTH_URL=wri-frontend breaks browser redirects)
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.login(reviewer, reviewerPassword);
      cy.viewport(1920, 1080);

      // Same URL the Review button builds in ApprovalRow
      cy.visit(`/datasets/${teamBDatasetName}?approval=true`);
      cy.contains(teamBDatasetName, { timeout: 15000 });

      cy.get("body", { timeout: 15000 }).should(($body) => {
        const hasApprove = $body.text().includes("Approve request");
        const hasToggle = $body.find("#toggle-version").length > 0;
        const hasYellowHighlight = $body.find(".bg-yellow-200").length > 0;

        expect(
          hasApprove,
          `unauthorized Team Admin must not see Approve/Reject (hasApprove=${hasApprove})`
        ).to.eq(false);
        expect(
          hasToggle,
          `unauthorized Team Admin must not see version toggle (hasToggle=${hasToggle})`
        ).to.eq(false);
        expect(
          hasYellowHighlight,
          `unauthorized Team Admin must not see change highlights (hasYellow=${hasYellowHighlight})`
        ).to.eq(false);
      });
    }
  );
});
