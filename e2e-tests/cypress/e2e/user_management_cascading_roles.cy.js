const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const userSuffix = Cypress.env("USER_NAME_SUFFIX");
const emailSuffix = "@test.com";

const uuid = () => Math.random().toString(36).slice(2);

const parentOrg = `${uuid()}${orgSuffix}`;
const childOrg = `${uuid()}${orgSuffix}`;
const grandchildOrg = `${uuid()}${orgSuffix}`;
const memberUser = `${uuid()}${userSuffix}`;
const editorUser = `${uuid()}${userSuffix}`;
const adminUser = `${uuid()}${userSuffix}`;
const memberUserEmail = `${uuid()}${emailSuffix}`;
const editorUserEmail = `${uuid()}${emailSuffix}`;
const adminUserEmail = `${uuid()}${emailSuffix}`;
const memberUserPassword = `${uuid()}`;
const editorUserPassword = `${uuid()}`;
const adminUserPassword = `${uuid()}`;

describe("Assigning Team User Roles", () => {
  before(() => {
    cy.createOrganizationAPI(parentOrg);
    cy.createOrganizationAPI(childOrg, "public", parentOrg);
    cy.createOrganizationAPI(grandchildOrg, "public", childOrg);

    cy.createUserApi(memberUser, memberUserEmail, memberUserPassword);
    cy.createUserApi(editorUser, editorUserEmail, editorUserPassword);
    cy.createUserApi(adminUser, adminUserEmail, adminUserPassword);

    cy.createOrganizationMemberAPI(parentOrg, memberUser, "member");
    cy.createOrganizationMemberAPI(parentOrg, editorUser, "editor");
    cy.createOrganizationMemberAPI(parentOrg, adminUser, "admin");
  });

  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Should have cascading roles from parent team", () => {
    cy.logout();

    cy.login(memberUser, memberUserPassword);

    // Members should not have the edit buttons
    cy.visit(`/teams/${childOrg}`);
    cy.contains("div", "Edit").should("not.exist");

    cy.visit(`/teams/${grandchildOrg}`);
    cy.contains("div", "Edit").should("not.exist");

    cy.visit(`/teams/${parentOrg}`);
    cy.contains("div", "Edit").should("not.exist");

    cy.logout();

    cy.login(editorUser, editorUserPassword);

    // Editors should not see the edit buttons
    cy.visit(`/teams/${childOrg}`);
    cy.contains("div", "Edit").should("not.exist");

    cy.visit(`/teams/${grandchildOrg}`);
    cy.contains("div", "Edit").should("not.exist");

    cy.visit(`/teams/${parentOrg}`);
    cy.contains("div", "Edit").should("not.exist");

    cy.logout();

    cy.login(adminUser, adminUserPassword);

    // Admins should have the edit buttons
    cy.visit(`/teams/${childOrg}`);
    cy.contains("div", "Edit").should("exist");
    cy.contains("div", "Edit").click();
    cy.get("input[name=title]").should("have.value", childOrg);
    cy.get("input[name=title]")
      .clear()
      .type(childOrg + " edited")
      .blur();
    cy.get("button[type=submit]").click();

    cy.visit(`/teams/${childOrg}`);
    cy.contains("div", "Edit").should("exist");
    cy.contains("div", "Edit")
      .click()
      .then(() => {
        cy.get("input[name=title]").should("have.value", childOrg + " edited");
      });

    cy.visit(`/teams/${grandchildOrg}`);
    cy.contains("div", "Edit").should("exist");
    cy.contains("div", "Edit").click();
    cy.get("input[name=title]").should("have.value", grandchildOrg);
    cy.get("input[name=title]")
      .clear()
      .type(grandchildOrg + " edited")
      .blur();
    cy.get("button[type=submit]").click();

    cy.visit(`/teams/${grandchildOrg}`);
    cy.contains("div", "Edit").should("exist");
    cy.contains("div", "Edit")
      .click()
      .then(() => {
        cy.get("input[name=title]").should(
          "have.value",
          grandchildOrg + " edited"
        );
      });

    cy.visit(`/teams/${parentOrg}`);
    cy.contains("div", "Edit").should("exist");
    cy.contains("div", "Edit").click();
    cy.get("input[name=title]").should("have.value", parentOrg);
    cy.get("input[name=title]")
      .clear()
      .type(parentOrg + " edited")
      .blur();
    cy.get("button[type=submit]").click();

    cy.visit(`/teams/${parentOrg}`);
    cy.contains("div", "Edit").should("exist");
    cy.contains("div", "Edit")
      .click()
      .then(() => {
        cy.get("input[name=title]").should("have.value", parentOrg + " edited");
      });
  });

  it("Should have specified roles from Member Management", () => {
    cy.createOrganizationMemberAPI(parentOrg, memberUser, "admin");
    cy.createOrganizationMemberAPI(childOrg, memberUser, "editor");

    cy.visit(`/dashboard/teams/${parentOrg}/edit`);
    cy.contains("div", "Members").click();
    cy.get("span.hidden")
      .filter(
        (_, el) => el.id.startsWith("members-") && el.id.endsWith("-user")
      )
      .filter((_, el) => el.getAttribute("data-value") === memberUser)
      .invoke("attr", "id")
      .then((userId) => {
        const index = userId.match(/members\-(\d+)\-user/)[1];
        cy.get(`#members-${index}-capacity`)
          .invoke("attr", "data-value")
          .should("eq", "admin");
      });

    cy.visit(`/dashboard/teams/${childOrg}/edit`);
    cy.contains("div", "Members").click();
    cy.get("span.hidden")
      .filter(
        (_, el) => el.id.startsWith("members-") && el.id.endsWith("-user")
      )
      .filter((_, el) => el.getAttribute("data-value") === memberUser)
      .invoke("attr", "id")
      .then((userId) => {
        const index = userId.match(/members\-(\d+)\-user/)[1];
        cy.get(`#members-${index}-capacity`)
          .invoke("attr", "data-value")
          .should("eq", "editor");
      });

    cy.visit(`/dashboard/teams/${grandchildOrg}/edit`);
    cy.contains("div", "Members").click();
    cy.get("span.hidden")
      .filter(
        (_, el) => el.id.startsWith("members-") && el.id.endsWith("-user")
      )
      .contains(memberUser)
      .should("not.exist");

    cy.logout();
    cy.login(memberUser, memberUserPassword);

    cy.visit(`/teams/${parentOrg}`);
    cy.contains("div", "Edit").should("exist");
    cy.contains("div", "Edit").click();
    cy.get("input[name=title]").should("have.value", parentOrg + " edited");
    cy.get("input[name=title]")
      .clear()
      .type(parentOrg + " edited again");
    cy.get("button[type=submit]").click();

    cy.visit(`/teams/${parentOrg}`);
    cy.contains(parentOrg + " edited again");

    cy.visit(`/teams/${childOrg}`);
    cy.contains("div", "Edit").should("not.exist");

    cy.visit(`/teams/${grandchildOrg}`);
    cy.contains("div", "Edit").should("not.exist");
  });

  after(() => {
    cy.deleteOrganizationAPI(parentOrg);
    cy.deleteOrganizationAPI(childOrg);
    cy.deleteOrganizationAPI(grandchildOrg);
    cy.deleteUserApi(memberUser);
    cy.deleteUserApi(editorUser);
    cy.deleteUserApi(adminUser);
  });
});
