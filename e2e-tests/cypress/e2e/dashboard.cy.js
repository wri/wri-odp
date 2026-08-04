const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const parentOrg = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName = `${uuid()}ttttopp${Cypress.env("DATASET_NAME_SUFFIX")}`;

const parentOrg2 = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const datasetName2 = `${uuid()}pdssfppp${Cypress.env("DATASET_NAME_SUFFIX")}`;

const group = `${uuid()}${Cypress.env("GROUP_SUFFIX")}`;
const application = `${uuid()}_application`;
const user = `${uuid()}-user`;
const email = `${uuid()}@gmail.com`;
const userfullname = `${uuid()}-fullname`;
const user_2 = `${uuid()}-test-user`;
const user_email_2 = `${uuid()}@gmail.com`;

describe("Dashboard Test", () => {
  before(() => {
    cy.createOrganizationAPI(parentOrg);
    cy.createDatasetAPI(parentOrg, datasetName, true, {
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

    cy.createOrganizationAPI(parentOrg2);
    cy.createDatasetAPI(parentOrg2, datasetName2, true, {
      short_description: "dashboard e2e dataset",
      technical_notes: "https://example.com/notes",
      visibility_type: "public",
    });
    cy.approvePendingDatasetAPI(datasetName2);

    cy.createGroupAPI(group);
    cy.createApplicationAPI(application);
    cy.createUserApi(user, email, "test1234");
    cy.createUserApi(user_2, user_email_2, "test1234");

    cy.userMetadata(user).as("sender");

    cy.userMetadata(ckanUserName).as("reciever");

    cy.datasetMetadata(datasetName).as("dataset");

    cy.get("@reciever").then((reciever) => {
      cy.get("@sender").then((sender) => {
        cy.get("@dataset").then((dataset) => {
          cy.addNotificationApi(
            reciever.id,
            sender.id,
            dataset.id,
            "new dataset"
          );
          cy.addNotificationApi(
            reciever.id,
            sender.id,
            dataset.id,
            "changed dataset"
          );
          cy.addNotificationApi(
            reciever.id,
            sender.id,
            dataset.id,
            "deleted dataset"
          );
        });
      });
    });
  });

  beforeEach(function() {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Should test dataset page", () => {
    cy.visit("/dashboard/datasets");
    cy.get("#alldataset").should("exist");
    cy.get("#alldataset").find("div").should("have.length.greaterThan", 0);

    cy.get('input[type="search"]').type(datasetName2).type("{enter}");

    cy.contains("div", datasetName2, { timeout: 20000 }).should("exist");
    cy.get("button#rowshow").first().click();
    cy.contains(parentOrg2);
  });

  it("Should test collaborator permission on dataset page", () => {
    cy.addPackageCollaboratorApi(user_2, datasetName2, "admin");
    cy.logout();
    cy.login(user_2, "test1234");
    cy.viewport("iphone-6");
    cy.visit("/dashboard/datasets");
    cy.get("#alldataset").should("exist");
    cy.get("#alldataset").find("div").should("have.length.greaterThan", 0);

    cy.get('input[type="search"]').type(datasetName2).type("{enter}");
    cy.contains("div", datasetName2, { timeout: 20000 }).should("exist");
    const buttonId = `delete-tooltip-${datasetName2}`;
    cy.get(`#${buttonId}`, { timeout: 15000 }).should("be.visible");
  });

  it("Should test activity stream", () => {
    cy.visit("/dashboard/activity-stream");
    cy.contains(`${ckanUserName} created the Dataset ${datasetName}`, {
      timeout: 15000,
    });
    cy.get('[id^="headlessui-listbox-button"]').first().click();
    cy.contains('[role="option"]', "new").click();
    cy.contains(`${ckanUserName} created the Dataset ${datasetName}`, {
      timeout: 15000,
    });
  });
  it("Should test activity stream select", () => {
    cy.visit("/dashboard/activity-stream");
    cy.contains(`${ckanUserName} created the Dataset ${datasetName}`, {
      timeout: 15000,
    });
    cy.get('[id^="headlessui-listbox-button"]').eq(1).click();
    cy.contains('[role="option"]', "Teams").click();
    cy.get('[id^="headlessui-listbox-button"]').eq(2).click();
    cy.contains('[role="option"]', `${parentOrg}`).click();
    cy.contains(`${ckanUserName} created the Dataset ${datasetName}`, {
      timeout: 20000,
    });
  });

  it("Should test user form", () => {
    cy.visit(`/dashboard/settings/edit/${user}`);
    cy.get('input[name="fullname"]').type(userfullname);
    cy.get('button[type="submit"]').click();
    cy.contains(`Successfully updated user: ${user}`);
  });

  it("Should test Users page", () => {
    cy.visit("/dashboard/users");
    cy.get('input[type="search"]').type(user).type("{enter}");
    cy.contains(user);
    cy.get(`button#delete-tooltip-${user}`).first().click({ force: true });
    cy.get(`button#${user}`).click();
  });
  it("Should test teams page", () => {
    cy.visit("dashboard/teams");
    cy.get('input[type="search"]').type(parentOrg).type("{enter}");
    cy.contains(parentOrg, { timeout: 15000 });
  });

  it("should delete dataset", () => {
    cy.visit("/dashboard/datasets");
    cy.get('input[type="search"]').type(datasetName2).type("{enter}");
    cy.contains(datasetName2, { timeout: 20000 }).should("exist");
    cy.get(`button#delete-tooltip-${datasetName2}`)
      .first()
      .click({ force: true });
    cy.get(`button#${datasetName2}`).click();
    cy.contains(`Successfully deleted the ${datasetName2} Dataset`, {
      timeout: 15000,
    });
  });
  it("should delete Team", () => {
    cy.visit("/dashboard/teams");
    cy.get('input[type="search"]').type(parentOrg2).type("{enter}");
    cy.contains(parentOrg2, { timeout: 20000 }).should("exist");
    cy.get(`button#delete-tooltip-${parentOrg2}`)
      .first()
      .click({ force: true });
    cy.get(`button#${parentOrg2}`).click();
    cy.contains(`Successfully deleted the ${parentOrg2} Team`, {
      timeout: 15000,
    });
  });

  it("should delete application", () => {
    cy.visit("/dashboard/applications");
    cy.contains(application, { timeout: 20000 }).should("exist");
    cy.get(`button#delete-tooltip-${application}`)
      .first()
      .click({ force: true });
    cy.get(`button#${application}`).click();
    cy.contains(`Successfully deleted the ${application} Application`, {
      timeout: 15000,
    });
  });

  it("should delete topic", () => {
    cy.visit("/dashboard/topics");
    cy.get('input[type="search"]').type(group).type("{enter}");
    cy.contains(group, { timeout: 20000 }).should("exist");
    cy.get(`button#delete-tooltip-${group}`).first().click({ force: true });
    cy.get(`button#${group}`).click();
    cy.contains(`Successfully deleted the ${group} Topic`, {
      timeout: 15000,
    });
  });

  it(
    "should test notification page",
    {
      retries: {
        runMode: 2,
        openMode: 0,
      },
    },
    () => {
      cy.viewport(1440, 900);
      cy.visit("/dashboard/notifications");
      cy.contains("deleted Dataset", { timeout: 15000 });
      cy.get("#select_all_notifications").click();
      cy.get("#markasread_hidden").click({ force: true });
      cy.contains("button", "Update Notification", { timeout: 30000 }).click({
        force: true,
      });
      cy.get("#unreadn").should("not.exist");
    }
  );

  it(
    "should delete notification",
    {
      retries: {
        runMode: 2,
        openMode: 0,
      },
    },
    () => {
      cy.viewport(1440, 900);
      cy.visit("/dashboard/notifications");
      cy.get('input[name="notifications"]').eq(1).check();
      cy.get('input[name="notifications"]').eq(1).should("be.checked");
      cy.get("#deletenotification").click();
      cy.contains("button", "Delete Notification", { timeout: 30000 }).click({
        force: true,
      });
      cy.contains("Successfully deleted the notification", {
        timeout: 15000,
      });
    }
  );

  it("Should see pending approval tag", () => {
    cy.visit("/dashboard/datasets");
    cy.contains(datasetName, { timeout: 30000 });
    cy.contains("Pending Approval");
  });

  it("Should reject dataset from dataset page", () => {
    // Sysadmin + pending revision shows Approve/Reject without ?approval=true.
    // Bare ?approval=true no longer unlocks the bar (approval gating fix).
    cy.visit("/datasets/" + datasetName);
    cy.contains("Reject request", { timeout: 20000 }).click();
    cy.get("input[id=title]").type("Test");
    cy.get(".tiptap.ProseMirror").type("Test");
    cy.get("button[id=reject]").click();
    cy.contains(/successfully rejected|Issue successfully created/i, {
      timeout: 20000,
    });
    cy.url({ timeout: 20000 }).should("include", "/dashboard/datasets");
  });

  it("Should have issues", () => {
    // Issue was created by the reject above; status is now "rejected" so the
    // Approve/Reject bar correctly no longer appears.
    cy.visit("/datasets/" + datasetName);
    cy.contains("Issues", { timeout: 20000 }).click({ force: true });
    cy.contains("Test", { timeout: 20000 }).should("be.visible");
  });

  it("Should view issues", () => {
    cy.visit("/datasets/" + datasetName);
    cy.contains("Issues", { timeout: 20000 }).click({ force: true });
    cy.contains("Test", { timeout: 20000 }).should("be.visible").click();
    cy.get(".tiptap.ProseMirror", { timeout: 15000 })
      .should("be.visible")
      .type("issue comment");
    cy.get("button").contains("Comment").click();
    cy.contains("Comment successfully added", { timeout: 15000 });
    cy.contains("issue comment", { timeout: 15000 });
  });

  it("Should be in awaiting approval", () => {
    cy.visit("/dashboard/datasets");
    cy.contains("Awaiting Approval").click();
    cy.get('input[type="search"]', { timeout: 15000 })
      .should("be.visible")
      .type(datasetName)
      .type("{enter}");
    cy.contains(datasetName, { timeout: 15000 }).should("exist");
  });

  it("Should edit pending dataset", () => {
    cy.visit("/dashboard/datasets/" + datasetName + "/edit");
    cy.get("input[name=title]", { timeout: 15000 })
      .clear()
      .type(datasetName + " EDITED");
    cy.get("button").contains("Update Dataset").click({ force: true });
    cy.contains(
      `Successfully edited the "${datasetName} EDITED" Dataset`,
      { timeout: 30000 },
    );
  });

  it("Should not have non-relevant values in the diff dropdown", () => {
    cy.visit("/dashboard/approval-request");
    cy.contains(datasetName, { timeout: 30000 });
    cy.get("button#rowshow").first().click();
    cy.contains("Title");
    cy.contains("null").should("not.exist");
    cy.contains("NULL").should("not.exist");
    cy.contains("empty").should("not.exist");
  });

  it("Should have approve dataset", () => {
    cy.visit("/dashboard/approval-request");
    cy.contains(datasetName, { timeout: 30000 });
    cy.get("button#rowshow").first().click();
    cy.contains("Title");
    cy.contains(datasetName + " EDITED");
    cy.get(`button#approve-tooltip-${datasetName}`)
      .first()
      .click({ force: true });
    cy.contains("button", "Approve Dataset").click({ force: true });
    cy.contains(/Successfully approved the Dataset/i, {
      timeout: 20000,
    });
  });

  after(() => {
    cy.deleteDatasetAPI(datasetName);
    cy.deleteOrganizationAPI(parentOrg);
    cy.deleteUserApi(user_2);
    cy.deleteUserApi(user);
  });
});
