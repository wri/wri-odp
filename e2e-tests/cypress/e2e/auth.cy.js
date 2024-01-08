const ckanUserName = Cypress.env("CKAN_USERNAME");
const ckanUserPassword = Cypress.env("CKAN_PASSWORD");

describe("Login modal", () => {
  it("can be found on the homepage", () => {
    cy.visit({ url: "/" });
    cy.get("#nav-login-button").click();
    cy.get("#login-modal").as("login-modal").should("be.visible");
  });

  it("can be found on the topics page", () => {
    cy.visit({ url: "/topics" });
    cy.get("#nav-login-button").click();
    cy.get("#login-modal").as("login-modal").should("be.visible");
  });

  it("can be used to sign in", () => {
    cy.visit({ url: "/" });
    cy.get("#nav-login-button").click();
    cy.get("#login-modal").as("login-modal");

    cy.get("@login-modal").get('input[name="username"]').type(ckanUserName);
    cy.get("@login-modal").get('input[name="password"]').type(ckanUserPassword);

    cy.get("button#login-button").click({ force: true });

    cy.get("#nav-user-menu").should("be.visible", { timeout: 10000});
  });

  it("can be used to sign in with an email", () => {
    cy.visit({ url: "/" });
    cy.get("#nav-login-button").click();
    cy.get("#login-modal").as("login-modal");

    cy.userMetadata(ckanUserName).as("user");
    cy.get("@user").then((user) => {
      cy.get("@login-modal").get('input[name="username"]').type(user.email);
      cy.get("@login-modal").get('input[name="password"]').type(ckanUserPassword);

      cy.get("button#login-button").click({ force: true });

      cy.get("#nav-user-menu").should("be.visible", { timeout: 10000});
    })
  });

  it("can be used to request a password reset link", () => {
    cy.visit({ url: "/" });
    cy.get("#nav-login-button").click();
    cy.get("#login-modal").as("login-modal");

    cy.get("#forgot-password-button").click();

    cy.get('input[name="email"]').type("datopian@gmail.com");

    cy.get("#request-reset-button").click();

    cy.contains("Password reset link sent to email address");

  });
});

describe("reset password form", () => {
  it("cannot be accessed unauthorized users", () => {
    cy.visit("/auth/password-reset");
    cy.url().should("not.include", "password-reset");
  });
});

describe("dashboard page", () => {
  it("can only be accessed by signed in users", () => {
    cy.visit("/dashboard");

    cy.url().should("not.include", "dashboard");

    cy.get("#nav-login-button").click();
    cy.get("#login-modal").as("login-modal");

    cy.get("@login-modal").get('input[name="username"]').type(ckanUserName);
    cy.get("@login-modal").get('input[name="password"]').type(ckanUserPassword);

    cy.get("button#login-button").click({ force: true });

    cy.get("#nav-user-menu").should("be.visible");

    cy.visit("/dashboard/datasets");
    cy.url().should("include", "dashboard");
  });
});
