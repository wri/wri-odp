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
const user = `${uuid()}-user`;
const email = `${uuid()}@gmail.com`;
const userfullname = `${uuid()}-fullname`;

describe("Dashboard Test", () => {
  let senderid;
  let receiverid;
  let datasetid;

  before(() => {
    cy.createOrganizationAPI(parentOrg);
    cy.createDatasetAPI(parentOrg, datasetName, true);

    cy.createOrganizationAPI(parentOrg2);
    cy.createDatasetAPI(parentOrg2, datasetName2, true);

    cy.createGroupAPI(group);
    cy.createUserApi(user, email, "test1234");

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
            "new dataset",
          );
          cy.addNotificationApi(
            reciever.id,
            sender.id,
            dataset.id,
            "changed dataset",
          );
          cy.addNotificationApi(
            reciever.id,
            sender.id,
            dataset.id,
            "deleted dataset",
          );
        });
      });
    });
  });

  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Should test dataset page", () => {
    cy.visit("/dashboard/datasets");
    cy.get("#alldataset").should("exist");
    cy.get("#alldataset").find("div").should("have.length.greaterThan", 0);

    cy.get('input[type="search"]').type(datasetName).type("{enter}");

    cy.contains("div", datasetName).should("exist", { timeout: 15000 });
    cy.get("button#rowshow").first().click();
    cy.contains(parentOrg);
  });

  it("Should test activity stream", () => {
    cy.visit("/dashboard/activity-stream");
    cy.contains(`${ckanUserName} created the package ${datasetName}`);
    cy.get('[id^="headlessui-listbox-button"]').first().click();
    cy.contains('[role="option"]', "new").click();
    cy.contains(`${ckanUserName} created the package ${datasetName}`);
  });
  it("Should test activity stream select", () => {
    cy.visit("/dashboard/activity-stream");
    cy.contains(`${ckanUserName} created the package ${datasetName}`);
    cy.get('[id^="headlessui-listbox-button"]').eq(1).click();
    cy.contains('[role="option"]', "teams").click();
    cy.get('[id^="headlessui-listbox-button"]').eq(2).click();
    cy.contains('[role="option"]', `${parentOrg}`).click();
    cy.contains(`${ckanUserName} created the package ${datasetName}`);
  });

  it("Should test user form", () => {
    cy.visit(`/dashboard/users/edit/${user}`);
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
    cy.contains(datasetName2).should("exist", { timeout: 15000 });
    cy.get(`button#delete-tooltip-${datasetName2}`)
      .first()
      .click({ force: true });
    cy.get(`button#${datasetName2}`).click();
    cy.contains(`Successfully deleted the ${datasetName2} dataset`);
  });
  it("should delete Team", () => {
    cy.visit("/dashboard/teams");
    cy.get('input[type="search"]').type(parentOrg2).type("{enter}");
    cy.contains(parentOrg2).should("exist", { timeout: 15000 });
    cy.get(`button#delete-tooltip-${parentOrg2}`)
      .first()
      .click({ force: true });
    cy.get(`button#${parentOrg2}`).click();
    cy.contains(`Successfully deleted the ${parentOrg2} team`);
  });

  it("should delete topic", () => {
    cy.visit("/dashboard/topics");
    cy.get('input[type="search"]').type(group).type("{enter}");
    cy.contains(group).should("exist", { timeout: 15000 });
    cy.get(`button#delete-tooltip-${group}`).first().click({ force: true });
    cy.get(`button#${group}`).click();
    cy.contains(`Successfully deleted the ${group} topic`);
  });

  it("should test notification page", () => {
    cy.viewport(1440, 900);
    cy.visit("/dashboard/notifications");
    cy.contains("deleted dataset");
    cy.get("#select_all_notifications").click();
    cy.get("#markedaction").click();
    cy.contains("Mark as read");
    cy.get("#markasread").as("btn").click();
    cy.contains("button", "Update Notification").click({ force: true });
    cy.get("#unreadn").should("not.exist");
  });

  it("should delete notification", () => {
    cy.visit("/dashboard/notifications");
    cy.get('input[aria-label="mark as read deleted dataset"]').check();
    cy.get('input[aria-label="mark as read deleted dataset"]').should(
      "be.checked",
    );
    cy.get("#deletenotification").click();
    cy.contains("Delete Notification");
    cy.contains("button", "Delete Notification").click({ force: true });
    cy.contains("deleted dataset").should("not.exist");
  });

  it("Should have issues", () => {
    cy.visit("/datasets/" + datasetName + "?approval=true");
    cy.contains("Reject request").click();
    cy.get("textarea[id=description]").type("Test");
    cy.get("input[id=title]").type("Test");
    cy.get("button[id=reject]").click();
    cy.contains("Issues").click();
    cy.contains("Test");
    cy.contains("Test").click();
    cy.get(".tiptap.ProseMirror").type("issue comment");
    cy.get("button").contains("Comment").click();
    cy.contains("issue comment");

    // delete issue
    cy.get("button").contains("Delete").click();
    cy.contains("Delete Issue");
    cy.get("button").contains("Delete Issue").click();
  });

  after(() => {
    cy.deleteDatasetAPI(datasetName);
    cy.deleteOrganizationAPI(parentOrg);
  });
});
