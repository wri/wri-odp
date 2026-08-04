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

  const assertNoEdit = (teamName) => {
    cy.contains("h2", teamName, { timeout: 15000 });
    cy.get("#team-header-card", { timeout: 15000 }).should("exist");
    // Wait for team query to settle, then assert no edit link
    cy.get("#team-header-card a[href*='/dashboard/teams/'][href$='/edit']", {
      timeout: 10000,
    }).should("not.exist");
  };

  const clickEdit = () =>
    cy
      .get("#team-header-card a[href*='/dashboard/teams/'][href$='/edit']", {
        timeout: 20000,
      })
      .first()
      .click();

  it("Should have cascading roles from parent team", () => {
    cy.login(memberUser, memberUserPassword);

    // Members should not have the edit buttons
    cy.visit(`/teams/${childOrg}`);
    assertNoEdit(childOrg);

    cy.visit(`/teams/${grandchildOrg}`);
    assertNoEdit(grandchildOrg);

    cy.visit(`/teams/${parentOrg}`);
    assertNoEdit(parentOrg);

    cy.logout();

    cy.login(editorUser, editorUserPassword);

    // Editors should not see the edit buttons
    cy.visit(`/teams/${childOrg}`);
    assertNoEdit(childOrg);

    cy.visit(`/teams/${grandchildOrg}`);
    assertNoEdit(grandchildOrg);

    cy.visit(`/teams/${parentOrg}`);
    assertNoEdit(parentOrg);

    cy.logout();

    cy.login(adminUser, adminUserPassword);

    // Admins should have the edit buttons (capacity may resolve via parent walk)
    cy.visit(`/teams/${childOrg}`);
    clickEdit();
    cy.get("input[name=title]", { timeout: 15000 }).should(
      "have.value",
      childOrg,
    );
    cy.get("input[name=title]")
      .clear()
      .type(childOrg + " edited")
      .blur();
    cy.get("button[type=submit]").click();
    cy.contains(`Successfully edited the ${childOrg} edited Team`, {
      timeout: 15000,
    });

    cy.visit(`/teams/${childOrg}`);
    clickEdit();
    cy.get("input[name=title]", { timeout: 15000 }).should(
      "have.value",
      childOrg + " edited",
    );

    cy.visit(`/teams/${grandchildOrg}`);
    clickEdit();
    cy.get("input[name=title]", { timeout: 15000 }).should(
      "have.value",
      grandchildOrg,
    );
    cy.get("input[name=title]")
      .clear()
      .type(grandchildOrg + " edited")
      .blur();
    cy.get("button[type=submit]").click();
    cy.contains(`Successfully edited the ${grandchildOrg} edited Team`, {
      timeout: 15000,
    });

    cy.visit(`/teams/${grandchildOrg}`);
    clickEdit();
    cy.get("input[name=title]", { timeout: 15000 }).should(
      "have.value",
      grandchildOrg + " edited",
    );

    cy.visit(`/teams/${parentOrg}`);
    clickEdit();
    cy.get("input[name=title]", { timeout: 15000 }).should(
      "have.value",
      parentOrg,
    );
    cy.get("input[name=title]")
      .clear()
      .type(parentOrg + " edited")
      .blur();
    cy.get("button[type=submit]").click();
    cy.contains(`Successfully edited the ${parentOrg} edited Team`, {
      timeout: 15000,
    });

    cy.visit(`/teams/${parentOrg}`);
    clickEdit();
    cy.get("input[name=title]", { timeout: 15000 }).should(
      "have.value",
      parentOrg + " edited",
    );
  });

  it("Should have specified roles from Member Management", () => {
    cy.login(ckanUserName, ckanUserPassword);
    cy.createOrganizationMemberAPI(parentOrg, memberUser, "admin");
    cy.createOrganizationMemberAPI(childOrg, memberUser, "editor");

    cy.visit(`/dashboard/teams/${parentOrg}/edit`);
    cy.contains("div", "Members").click();
    cy.get("span.hidden")
      .filter(
        (_, el) => el.id.startsWith("members-") && el.id.endsWith("-user"),
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
        (_, el) => el.id.startsWith("members-") && el.id.endsWith("-user"),
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
        (_, el) => el.id.startsWith("members-") && el.id.endsWith("-user"),
      )
      .contains(memberUser)
      .should("not.exist");

    cy.logout();
    cy.login(memberUser, memberUserPassword);

    cy.visit(`/teams/${parentOrg}`);
    clickEdit();
    cy.get("input[name=title]", { timeout: 15000 }).should(
      "have.value",
      parentOrg + " edited",
    );
    cy.get("input[name=title]")
      .clear()
      .type(parentOrg + " edited again")
      .blur();
    cy.get("button[type=submit]").click();
    cy.contains(`Successfully edited the ${parentOrg} edited again Team`, {
      timeout: 15000,
    });

    cy.visit(`/teams/${parentOrg}`);
    clickEdit();
    cy.get("input[name=title]", { timeout: 15000 }).should(
      "have.value",
      parentOrg + " edited again",
    );

    cy.visit(`/teams/${childOrg}`);
    // Editor on child cannot edit the team itself (admin-only)
    assertNoEdit(childOrg);

    cy.visit(`/teams/${grandchildOrg}`);
    assertNoEdit(grandchildOrg);
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
