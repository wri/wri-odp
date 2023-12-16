const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");
const orgSuffix = Cypress.env("ORG_NAME_SUFFIX");
const datasetSuffix = Cypress.env("DATASET_NAME_SUFFIX");

const uuid = () => Math.random().toString(36).slice(2) + "-test";

const teamOne = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}`;
const teamTwo = `${uuid()}${Cypress.env("ORG_NAME_SUFFIX")}_2`;
const topicOne = `${uuid()}${Cypress.env("GROUP_SUFFIX")}`;
const topicTwo = `${uuid()}${Cypress.env("GROUP_SUFFIX")}_2`;
const adminUser = `${uuid()}${Cypress.env("USER_NAME_SUFFIX")}_admin`;
const editorUser = `${uuid()}${Cypress.env("USER_NAME_SUFFIX")}_editor`;
const normalUser = `${uuid()}${Cypress.env("USER_NAME_SUFFIX")}_member`;
const switchUser = `${uuid()}${Cypress.env("USER_NAME_SUFFIX")}_switch`;
const adminUserPassword = "test1234";
const editorUserPassword = "test1234";
const normalUserPassword = "test1234";
const switchUserPassword = "test1234";
const adminUserEmail = Math.random().toString(36).slice(2) + "@test.com";
const editorUserEmail = Math.random().toString(36).slice(2) + "@test.com";
const normalUserEmail = Math.random().toString(36).slice(2) + "@test.com";
const switchUserEmail = Math.random().toString(36).slice(2) + "@test.com";

describe("Can add and remove members from teams and topics", () => {
  before(() => {
    cy.createOrganizationAPI(teamOne);
    cy.createOrganizationAPI(teamTwo);
    cy.createGroupAPI(topicOne);
    cy.createGroupAPI(topicTwo);
    cy.createUserApi(adminUser, adminUserEmail, adminUserPassword);
    cy.createUserApi(editorUser, editorUserEmail, editorUserPassword);
    cy.createUserApi(normalUser, normalUserEmail, normalUserPassword);
    cy.createUserApi(switchUser, switchUserEmail, switchUserPassword);
  });
  beforeEach(function () {
    cy.login(ckanUserName, ckanUserPassword);
  });

  it("Add members to a team", () => {
    cy.visit(`/dashboard/teams/${teamOne}/edit`);
    cy.contains("Members").click();
    cy.contains("span", "Add another member").click();
    var userField =
      "input.relative.text-left.block.w-full.rounded-md.border-0.px-5.py-3.text-gray-900.shadow-sm.ring-1.ring-inset.ring-gray-300.placeholder\\:text-gray-400.focus\\:border-b-2.focus\\:border-blue-800.focus\\:bg-slate-100.focus\\:ring-0.focus\\:ring-offset-0.sm\\:text-sm.sm\\:leading-6.max-w-\\[70rem\\]";
    var roleField =
      "button.relative.text-left.block.w-full.rounded-md.border-0.px-5.py-3.text-gray-900.shadow-sm.ring-1.ring-inset.ring-gray-300.placeholder\\:text-gray-400.focus\\:border-b-2.focus\\:border-blue-800.focus\\:bg-slate-100.focus\\:ring-0.focus\\:ring-offset-0.sm\\:text-sm.sm\\:leading-6";
    cy.get(userField)
      .last()
      .click()
      .type(adminUser + "{enter}");
    cy.get(roleField).last().click().focused().type("A{enter}");
    cy.contains("span", "Add another member").click();
    cy.get(userField)
      .last()
      .click()
      .type(editorUser + "{enter}");
    cy.get(roleField).last().click().focused().type("E{enter}");
    cy.contains("span", "Add another member").click();
    cy.get(userField)
      .last()
      .click()
      .focused()
      .type(normalUser + "{enter}");
    cy.get(roleField).last().click().focused().type("M{enter}");
    cy.contains("button", "Save").click();

    cy.wait(1000);

    cy.visit(`/dashboard/teams/${teamOne}/edit`);
    cy.contains("Members").click();

    const expectedUsers = [
      { username: adminUser, role: "Admin" },
      { username: editorUser, role: "Editor" },
      { username: normalUser, role: "Member" },
    ];

    const foundUsers = [];

    cy.get(
      ".flex.flex-col.gap-y-4 .grid.grow.grid-cols-1.items-start.gap-x-24.md\\:grid-cols-2"
    )
      .should("have.length.gt", 0)
      .each(($memberContainer, index) => {
        cy.wrap($memberContainer).within(() => {
          cy.get('input[role="combobox"]')
            .invoke("val")
            .then((userValue) => {
              cy.get('button[aria-haspopup="listbox"]')
                .invoke("text")
                .then((capacityValue) => {
                  const foundUser = expectedUsers.find(
                    (user) => user.username === userValue
                  );

                  if (foundUser) {
                    expect(capacityValue.trim()).to.equal(foundUser.role);
                    foundUsers.push(foundUser.username);
                  } else {
                    cy.log(`User ${userValue} is not in expectedUsers`);
                  }
                });
            });
        });
      })
      .then(() => {
        expectedUsers.forEach((user) => {
          expect(foundUsers).to.include(user.username);
        });
      });

    cy.logout();
    cy.login(adminUser, adminUserPassword);
    cy.visit("/dashboard/notifications");
    cy.wait(20000);
    cy.contains(ckanUserName);
    cy.contains(" added you as a member (admin) in the team");
    cy.contains(teamOne);

    cy.logout();
    cy.login(editorUser, editorUserPassword);
    cy.visit("/dashboard/notifications");
    cy.wait(20000);
    cy.contains(ckanUserName);
    cy.contains(" added you as a member (editor) in the team");
    cy.contains(teamOne);

    cy.logout();
    cy.login(normalUser, normalUserPassword);
    cy.visit("/dashboard/notifications");
    cy.wait(20000);
    cy.contains(ckanUserName);
    cy.contains(" added you as a member in the team");
    cy.contains(teamOne);
  });

  it("Switch team member roles", () => {
    cy.visit(`/dashboard/teams/${teamTwo}/edit`);
    cy.contains("Members").click();

    cy.contains("span", "Add another member").click();
    var userField =
      "input.relative.text-left.block.w-full.rounded-md.border-0.px-5.py-3.text-gray-900.shadow-sm.ring-1.ring-inset.ring-gray-300.placeholder\\:text-gray-400.focus\\:border-b-2.focus\\:border-blue-800.focus\\:bg-slate-100.focus\\:ring-0.focus\\:ring-offset-0.sm\\:text-sm.sm\\:leading-6.max-w-\\[70rem\\]";
    var roleField =
      "button.relative.text-left.block.w-full.rounded-md.border-0.px-5.py-3.text-gray-900.shadow-sm.ring-1.ring-inset.ring-gray-300.placeholder\\:text-gray-400.focus\\:border-b-2.focus\\:border-blue-800.focus\\:bg-slate-100.focus\\:ring-0.focus\\:ring-offset-0.sm\\:text-sm.sm\\:leading-6";
    cy.get(userField)
      .last()
      .click()
      .focused()
      .type(switchUser + "{enter}");
    cy.get(roleField).last().click().focused().type("M{enter}");
    cy.contains("button", "Save").click();

    cy.visit(`/dashboard/teams/${teamTwo}/edit`);
    cy.contains("Members").click();

    cy.get(
      ".flex.flex-col.gap-y-4 .grid.grow.grid-cols-1.items-start.gap-x-24.md\\:grid-cols-2"
    )
      .should("have.length.gt", 0)
      .each(($gridRow, index) => {
        cy.wrap($gridRow).within(() => {
          cy.get('input[role="combobox"]')
            .invoke("val")
            .then((userValue) => {
              if (userValue === switchUser) {
                cy.get('button[id^="headlessui-listbox-button"]').then(
                  ($capacityButton) => {
                    if ($capacityButton.length) {
                      cy.wrap($capacityButton).click();

                      cy.contains("li", "Admin").click();
                    } else {
                      cy.log("No capacity button found for the user");
                    }
                  }
                );
              }
            });
        });
      });

    cy.contains("button", "Save").click();

    cy.wait(1000);

    cy.logout();
    cy.login(switchUser, switchUserPassword);
    cy.visit("/dashboard/notifications");
    cy.contains(ckanUserName);
    cy.contains(' updated your member status to "admin" in the team');
  });

  it("Remove members from team", () => {
    cy.visit(`/dashboard/teams/${teamTwo}/edit`);
    cy.contains("Members").click();

    cy.get(
      ".flex.flex-col.gap-y-4 .grid.grow.grid-cols-1.items-start.gap-x-24.md\\:grid-cols-2"
    )
      .should("have.length.gt", 0)
      .each(($gridRow, index) => {
        cy.wrap($gridRow).within(() => {
          cy.get('input[role="combobox"]')
            .invoke("val")
            .then((userValue) => {
              if (userValue === switchUser) {
                cy.wrap($gridRow)
                  .parent()
                  .find('svg[data-state="closed"]')
                  .click();
              }
            });
        });
      });

    cy.contains("button", "Save").click();

    cy.visit(`/dashboard/teams/${teamTwo}/edit`);
    cy.contains("Members").click();

    cy.get(
      ".flex.flex-col.gap-y-4 .grid.grow.grid-cols-1.items-start.gap-x-24.md\\:grid-cols-2"
    )
      .should("have.length.gt", 0)
      .each(($gridRow, index) => {
        cy.wrap($gridRow).within(() => {
          cy.get('input[role="combobox"]')
            .invoke("val")
            .then((userValue) => {
              expect(userValue).to.not.equal(switchUser);
            });
        });
      });
  });

  it("Add members to a topic", () => {
    cy.visit(`/dashboard/topics/${topicOne}/edit`);
    cy.contains("Members").click();
    cy.contains("span", "Add another member").click();
    var userField =
      "input.relative.text-left.block.w-full.rounded-md.border-0.px-5.py-3.text-gray-900.shadow-sm.ring-1.ring-inset.ring-gray-300.placeholder\\:text-gray-400.focus\\:border-b-2.focus\\:border-blue-800.focus\\:bg-slate-100.focus\\:ring-0.focus\\:ring-offset-0.sm\\:text-sm.sm\\:leading-6.max-w-\\[70rem\\]";
    var roleField =
      "button.relative.text-left.block.w-full.rounded-md.border-0.px-5.py-3.text-gray-900.shadow-sm.ring-1.ring-inset.ring-gray-300.placeholder\\:text-gray-400.focus\\:border-b-2.focus\\:border-blue-800.focus\\:bg-slate-100.focus\\:ring-0.focus\\:ring-offset-0.sm\\:text-sm.sm\\:leading-6";
    cy.get(userField)
      .last()
      .click()
      .type(adminUser + "{enter}");
    cy.get(roleField).last().click().focused().type("A{enter}");
    cy.contains("span", "Add another member").click();
    cy.get(userField)
      .last()
      .click()
      .type(editorUser + "{enter}");
    cy.get(roleField).last().click().focused().type("E{enter}");
    cy.contains("span", "Add another member").click();
    cy.get(userField)
      .last()
      .click()
      .focused()
      .type(normalUser + "{enter}");
    cy.get(roleField).last().click().focused().type("M{enter}");
    cy.contains("button", "Save").click();

    cy.wait(1000);

    cy.visit(`/dashboard/topics/${topicOne}/edit`);
    cy.contains("Members").click();

    const expectedUsers = [
      { username: adminUser, role: "Admin" },
      { username: editorUser, role: "Editor" },
      { username: normalUser, role: "Member" },
    ];

    const foundUsers = [];

    cy.get(
      ".flex.flex-col.gap-y-4 .grid.grow.grid-cols-1.items-start.gap-x-24.md\\:grid-cols-2"
    )
      .should("have.length.gt", 0)
      .each(($memberContainer, index) => {
        cy.wrap($memberContainer).within(() => {
          cy.get('input[role="combobox"]')
            .invoke("val")
            .then((userValue) => {
              cy.get('button[aria-haspopup="listbox"]')
                .invoke("text")
                .then((capacityValue) => {
                  const foundUser = expectedUsers.find(
                    (user) => user.username === userValue
                  );

                  if (foundUser) {
                    expect(capacityValue.trim()).to.equal(foundUser.role);
                    foundUsers.push(foundUser.username);
                  } else {
                    cy.log(`User ${userValue} is not in expectedUsers`);
                  }
                });
            });
        });
      })
      .then(() => {
        expectedUsers.forEach((user) => {
          expect(foundUsers).to.include(user.username);
        });
      });

    cy.logout();
    cy.login(adminUser, adminUserPassword);
    cy.visit("/dashboard/notifications");
    cy.wait(20000);
    cy.contains(ckanUserName);
    cy.contains(" added you as a member (admin) in the topic");
    cy.contains(topicOne);

    cy.logout();
    cy.login(editorUser, editorUserPassword);
    cy.visit("/dashboard/notifications");
    cy.wait(20000);
    cy.contains(ckanUserName);
    cy.contains(" added you as a member (editor) in the topic");
    cy.contains(topicOne);

    cy.logout();
    cy.login(normalUser, normalUserPassword);
    cy.visit("/dashboard/notifications");
    cy.wait(20000);
    cy.contains(ckanUserName);
    cy.contains(" added you as a member in the topic");
    cy.contains(topicOne);
  });

  it("Switch topic member roles", () => {
    cy.visit(`/dashboard/topics/${topicTwo}/edit`);
    cy.contains("Members").click();

    cy.contains("span", "Add another member").click();
    var userField =
      "input.relative.text-left.block.w-full.rounded-md.border-0.px-5.py-3.text-gray-900.shadow-sm.ring-1.ring-inset.ring-gray-300.placeholder\\:text-gray-400.focus\\:border-b-2.focus\\:border-blue-800.focus\\:bg-slate-100.focus\\:ring-0.focus\\:ring-offset-0.sm\\:text-sm.sm\\:leading-6.max-w-\\[70rem\\]";
    var roleField =
      "button.relative.text-left.block.w-full.rounded-md.border-0.px-5.py-3.text-gray-900.shadow-sm.ring-1.ring-inset.ring-gray-300.placeholder\\:text-gray-400.focus\\:border-b-2.focus\\:border-blue-800.focus\\:bg-slate-100.focus\\:ring-0.focus\\:ring-offset-0.sm\\:text-sm.sm\\:leading-6";
    cy.get(userField)
      .last()
      .click()
      .focused()
      .type(switchUser + "{enter}");
    cy.get(roleField).last().click().focused().type("M{enter}");
    cy.contains("button", "Save").click();

    cy.visit(`/dashboard/topics/${topicTwo}/edit`);
    cy.contains("Members").click();

    cy.get(
      ".flex.flex-col.gap-y-4 .grid.grow.grid-cols-1.items-start.gap-x-24.md\\:grid-cols-2"
    )
      .should("have.length.gt", 0)
      .each(($gridRow, index) => {
        cy.wrap($gridRow).within(() => {
          cy.get('input[role="combobox"]')
            .invoke("val")
            .then((userValue) => {
              if (userValue === switchUser) {
                cy.get('button[id^="headlessui-listbox-button"]').then(
                  ($capacityButton) => {
                    if ($capacityButton.length) {
                      cy.wrap($capacityButton).click();

                      cy.contains("li", "Admin").click();
                    } else {
                      cy.log("No capacity button found for the user");
                    }
                  }
                );
              }
            });
        });
      });

    cy.contains("button", "Save").click();

    cy.wait(1000);

    cy.logout();
    cy.login(switchUser, switchUserPassword);
    cy.visit("/dashboard/notifications");
    cy.contains(ckanUserName);
    cy.contains(' updated your member status to "admin" in the topic');
  });

  it("Remove members from topic", () => {
    cy.visit(`/dashboard/topics/${topicTwo}/edit`);
    cy.contains("Members").click();

    cy.get(
      ".flex.flex-col.gap-y-4 .grid.grow.grid-cols-1.items-start.gap-x-24.md\\:grid-cols-2"
    )
      .should("have.length.gt", 0)
      .each(($gridRow, index) => {
        cy.wrap($gridRow).within(() => {
          cy.get('input[role="combobox"]')
            .invoke("val")
            .then((userValue) => {
              if (userValue === switchUser) {
                cy.wrap($gridRow)
                  .parent()
                  .find('svg[data-state="closed"]')
                  .click();
              }
            });
        });
      });

    cy.contains("button", "Save").click();

    cy.visit(`/dashboard/topics/${topicTwo}/edit`);
    cy.contains("Members").click();

    cy.get(
      ".flex.flex-col.gap-y-4 .grid.grow.grid-cols-1.items-start.gap-x-24.md\\:grid-cols-2"
    )
      .should("have.length.gt", 0)
      .each(($gridRow, index) => {
        cy.wrap($gridRow).within(() => {
          cy.get('input[role="combobox"]')
            .invoke("val")
            .then((userValue) => {
              expect(userValue).to.not.equal(switchUser);
            });
        });
      });

    cy.logout();
    cy.login(switchUser, switchUserPassword);
    cy.visit("/dashboard/notifications");
    cy.contains(ckanUserName);
    cy.contains(" removed you as a member (admin) from the topic");
  });

  after(() => {
    cy.deleteOrganizationAPI(teamOne);
    cy.deleteOrganizationAPI(teamTwo);
    cy.deleteGroupAPI(topicOne);
    cy.deleteGroupAPI(topicTwo);
    cy.deleteUserApi(adminUser);
    cy.deleteUserApi(editorUser);
    cy.deleteUserApi(normalUser);
    cy.deleteUserApi(switchUser);
  });
});
