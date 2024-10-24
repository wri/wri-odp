// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import "cypress-axe";

const cypressUpload = require("cypress-file-upload");
const headers = { Authorization: Cypress.env("API_KEY") };

const getRandomDatasetName = () =>
  Math.random().toString(36).slice(2) + Cypress.env("DATASET_NAME_SUFFIX");
const getRandomOrganizationName = () =>
  Math.random().toString(36).slice(2) + Cypress.env("ORG_NAME_SUFFIX");

const apiUrl = (path) => {
  return `${Cypress.config().apiUrl}/api/3/action/${path}`;
};

Cypress.Commands.add("login", (username, password) => {
  cy.session([username, password], () => {
    cy.visit("/");
    cy.get("#nav-login-button").click();
    cy.get("#login-modal").as("login-modal");

    cy.get("@login-modal").get('input[name="username"]').type(username);
    cy.get("@login-modal").get('input[name="password"]').type(password);

    cy.get("button#login-button").click({ force: true });

    cy.get("#nav-user-menu").should("be.visible");
  });
});

Cypress.Commands.add("logout", () => {
  cy.visit("/");
  cy.get("#nav-user-menu").click();
  cy.get(":nth-child(3) > .px-2").should("be.visible").as("menuItem");
  cy.get("@menuItem").click();
});

Cypress.Commands.add("createDatasetWithoutFile", (name) => {
  cy.visit({ url: "/dataset" }).then((resp) => {
    const datasetName = name || getRandomDatasetName();
    cy.get(".page_primary_action > .btn").click();
    cy.get("#field-title").type(datasetName);
    cy.get(".btn-xs").click();
    cy.get("#field-name").clear().type(datasetName);
    cy.get("button.btn-primary[type=submit]").click();
    cy.wrap(datasetName);
  });
});

Cypress.Commands.add("createDataset", (dataset = false, private_vis = true) => {
  let datasetName = dataset;
  let is_private = private_vis;
  cy.visit({ url: "/dataset" }).then((resp) => {
    if (!datasetName) {
      datasetName = getRandomDatasetName();
    }
    cy.get(".page_primary_action > .btn").click();
    cy.get("#field-title").type(datasetName);
    cy.get(".btn-xs").click();
    cy.get("#field-name").clear().type(datasetName);
    if (!is_private) {
      cy.get("#field-private").select("False");
    }
    cy.get("button.btn-primary[type=submit]").click();
    cy.get("#field-image-upload").attachFile({
      filePath: "sample.csv",
      fileName: "sample.csv",
    });
    cy.get(".btn-primary").click();
    cy.get(".content_action > .btn");
    cy.wrap(datasetName);
  });
});

Cypress.Commands.add("createLinkedDataset", () => {
  cy.visit({ url: "/dataset" }).then((resp) => {
    const datasetName = getRandomDatasetName();
    cy.get(".page_primary_action > .btn").click();
    cy.get("#field-title").type(datasetName);
    cy.get(".btn-xs").click();
    cy.get("#field-name").clear().type(datasetName);
    cy.get("button.btn-primary[type=submit]").click({ force: true });
    cy.get(
      '[title="Link to a URL on the internet (you can also link to an API)"]',
    ).click();
    cy.get("#field-image-url")
      .clear()
      .type(
        "https://raw.githubusercontent.com/datapackage-examples/sample-csv/master/sample.csv",
      );
    cy.get(".btn-primary").click();
    cy.get(".content_action > .btn");
    cy.wrap(datasetName);
  });
});

Cypress.Commands.add("updatePackageMetadata", (datasetName) => {
  const request = cy.request({
    method: "POST",
    url: apiUrl("package_patch"),
    headers: headers,
    body: {
      id: datasetName,
      notes: "Update notes",
    },
  });
});

Cypress.Commands.add("updateResourceMetadata", (datasetName) => {
  const request = cy.request({
    method: "POST",
    url: apiUrl("resource_patch"),
    headers: headers,
    body: {
      id: datasetName,
      description: "Update description",
    },
  });
});

Cypress.Commands.add("deleteDataset", (datasetName) => {
  cy.visit({ url: "/dataset/delete/" + datasetName }).then(() => {
    cy.get("form#confirm-dataset-delete-form > .btn-primary").click();
    cy.contains("Dataset has been deleted.");
  });
});

Cypress.Commands.add("purgeDataset", (datasetName) => {
  const request = cy.request({
    method: "POST",
    url: apiUrl("dataset_purge"),
    headers: headers,
    body: {
      id: datasetName,
    },
  });
});

Cypress.Commands.add("purgeGroup", (groupName) => {
  const request = cy.request({
    method: "POST",
    url: apiUrl("group_purge"),
    headers: headers,
    body: {
      id: groupName,
    },
  });
});

Cypress.Commands.add("purgeOrganization", (orgName) => {
  const request = cy.request({
    method: "POST",
    url: apiUrl("organization_purge"),
    headers: headers,
    body: {
      id: orgName,
    },
  });
});

Cypress.Commands.add("createOrganization", () => {
  const organizationName = getRandomOrganizationName();
  cy.get(".nav > :nth-child(2) > a").first().click();
  cy.get(".page_primary_action > .btn").click();
  cy.get("#field-name").type(organizationName);
  cy.get(".btn-xs").click();
  cy.get("#field-url").clear().type(organizationName);
  cy.get(".form-actions > .btn").click();
  cy.location("pathname").should("eq", "/organization/" + organizationName);
  cy.wrap(organizationName);
});

Cypress.Commands.add("deleteOrganization", (orgName) => {
  cy.visit({ url: "/organization/" + orgName }).then(() => {
    cy.get(".content_action > .btn").click();
    cy.get(".form-actions > .btn-danger").click();
    cy.get(".btn-primary").click();
    cy.contains("Organization has been deleted.");
  });
});

// Command for frontend test sepecific
Cypress.Commands.add("createOrganizationAPI", (name) => {
  cy.request({
    method: "POST",
    url: apiUrl("organization_create"),
    headers: headers,
    body: {
      name: name,
      title: name,
      description: "Some organization description",
    },
  });
});

// Command for frontend test sepecific
Cypress.Commands.add(
  "createOrganizationMemberAPI",
  (org, member, role = "editor") => {
    cy.request({
      method: "POST",
      url: apiUrl("organization_member_create"),
      headers: headers,
      body: {
        id: org,
        username: member,
        role,
      },
    });
  },
);

// Command for frontend test sepecific
Cypress.Commands.add("createGroupAPI", (name, parent=null) => {
  cy.request({
    method: "POST",
    url: apiUrl("group_create"),
    headers: headers,
    body: parent? {
      name: name,
      title: name,
      description: "Some sub-topic description",
      groups: [{name: parent}],
    } :{
      name: name,
      title: name,
      description: "Some group description",
    },
  });
});

Cypress.Commands.add("deleteGroupAPI", (name) => {
  cy.request({
    method: "POST",
    url: apiUrl("group_delete"),
    headers: headers,
    body: { id: name },
  });
});

Cypress.Commands.add("deleteOrganizationAPI", (name) => {
  cy.request({
    method: "POST",
    url: apiUrl("organization_delete"),
    headers: headers,
    body: { id: name },
  });
});

Cypress.Commands.add(
  "createDatasetAPI",
  (organization, name, isSubscribable, otherFields) => {
    const request = cy.request({
      method: "POST",
      url: apiUrl("package_create"),
      headers: headers,
      body: {
        owner_org: organization,
        name: name,
        authors: [{ name: "Datopian", email: "datopian@example.com" }],
        maintainers: [{ name: "Datopian", email: "datopian@example.com" }],
        license_id: "notspecified",
        approval_status: "approved",
        is_approved: "true",
        draft: "false",
        tags: [{ display_name: "subscriable", name: "subscriable" }],
        ...otherFields,
      },
    });

    if (!isSubscribable) {
      request.then((response) => {
        const datasetId = response.body.result.id;
        cy.request({
          method: "POST",
          url: dataSubscriptionApiUrl(`nonsubscribable_datasets/${datasetId}`),
          headers: headers,
        });
      });
    }
  },
);

Cypress.Commands.add("createResourceAPI", (datasetId, resource) => {
  const request = cy.request({
    method: "POST",
    url: apiUrl("resource_create"),
    headers: headers,
    body: {
      package_id: datasetId,
      ...resource,
      force: "True",
    },
  });
});

Cypress.Commands.add("approvePendingDatasetAPI", (datasetName) => {
  cy.log(datasetName);
  const request = cy
    .request({
      url: apiUrl("package_show" + "?id=" + datasetName),
      headers: headers,
    })
    .then((response) => {
      const datasetId = response.body.result.id;
      const request2 = cy.request({
        method: "POST",
        url: apiUrl("approve_pending_dataset"),
        headers: headers,
        body: {
          dataset_id: datasetId,
        },
      });
    });
});

Cypress.Commands.add("datapusherSubmit", (resource_id) => {
  const request = cy.request({
    method: "POST",
    url: apiUrl("datapusher_submit"),
    headers: headers,
    body: {
      resource_id,
    },
  });
});

Cypress.Commands.add("updateResourceRecord", (resource) => {
  const request = cy.request({
    method: "POST",
    url: apiUrl("datastore_upsert"),
    headers: headers,
    body: {
      resource_id: resource,
      records: [
        {
          name: "Jhon lenon",
          age: 60,
        },
      ],
      method: "insert",
      force: true,
    },
  });
});

Cypress.Commands.add("deleteDatasetAPI", (name) => {
  const request = cy.request({
    method: "POST",
    url: apiUrl("package_delete"),
    headers: headers,
    body: {
      id: name,
    },
  });
});

Cypress.Commands.add("datasetCount", (name) => {
  return cy
    .request({
      method: "GET",
      url: apiUrl("package_search"),
      headers: headers,
      body: {
        rows: 1,
      },
    })
    .then((res) => {
      return res.body.result.count;
    });
});

Cypress.Commands.add("groupCount", (name) => {
  return cy
    .request({
      method: "GET",
      url: apiUrl("organization_list"),
      headers: headers,
    })
    .then((res) => {
      return res.body.result.length;
    });
});

Cypress.Commands.add("facetFilter", (facetType, facetValue) => {
  return cy
    .request({
      method: "GET",
      url: apiUrl("package_search"),
      headers: headers,
      qs: {
        fq: `${facetType}:${facetValue}`,
      },
    })
    .then((res) => {
      return res.body.result.count;
    });
});

Cypress.Commands.add("prepareFile", (dataset, file, format) => {
  cy.fixture(`${file}`, "binary")
    .then(Cypress.Blob.binaryStringToBlob)
    .then((blob) => {
      var data = new FormData();
      data.append("package_id", `${dataset}`);
      data.append("name", `${file}`);
      data.append("format", `${format}`);
      data.append(
        "description",
        "Lorem Ipsum is simply dummy text of the printing and type",
      );
      data.append("upload", blob, `${file}`);
      var xhr = new XMLHttpRequest();
      xhr.withCredentials = true;
      xhr.open("POST", apiUrl("resource_create"));
      xhr.setRequestHeader("Authorization", headers.Authorization);
      xhr.send(data);
    });
});

Cypress.Commands.add("datasetMetadata", (dataset) => {
  return cy
    .request({
      method: "GET",
      url: apiUrl("package_show"),
      headers: headers,
      qs: {
        id: dataset,
      },
    })
    .then((res) => {
      return res.body.result;
    });
});

Cypress.Commands.add("orgMetadata", (org) => {
  return cy
    .request({
      method: "GET",
      url: apiUrl("organization_show"),
      headers: headers,
      qs: {
        id: org,
      },
    })
    .then((res) => {
      return res.body.result;
    });
});

Cypress.Commands.add("iframe", { prevSubject: "element" }, ($iframe) => {
  const $iframeDoc = $iframe.contents();
  const findBody = () => $iframeDoc.find("body");
  if ($iframeDoc.prop("readyState") === "complete") return findBody();
  return Cypress.Promise((resolve) =>
    $iframe.on("load", () => resolve(findBody())),
  );
});

Cypress.Commands.add("createUserApi", (name, email, password) => {
  const request = cy.request({
    method: "POST",
    url: apiUrl("user_create"),
    headers: headers,
    body: {
      name: name,
      email: email,
      password: password,
    },
  });
});

Cypress.Commands.add("deleteUserApi", (name) => {
  const request = cy.request({
    method: "POST",
    url: apiUrl("user_delete"),
    headers: headers,
    body: {
      id: name,
    },
  });
});

Cypress.Commands.add(
  "addPackageCollaboratorApi",
  (username, packageId, capacity) => {
    const request = cy.request({
      method: "POST",
      url: apiUrl("package_collaborator_create"),
      headers: headers,
      body: {
        id: packageId,
        user_id: username,
        capacity: capacity,
      },
    });
  },
);

Cypress.Commands.add(
  "addPackageIssueApi",
  (packageId, issueTitle, issueDescription) => {
    const request = cy.request({
      method: "POST",
      url: apiUrl("issue_create"),
      headers: headers,
      body: {
        dataset_id: packageId,
        title: issueTitle,
        description: issueDescription,
      },
    });
  },
);

Cypress.Commands.add(
  "addNotificationApi",
  (recipient, sender, object_id, activity_type) => {
    cy.request({
      method: "POST",
      url: apiUrl("notification_create"),
      headers: headers,
      body: {
        recipient_id: recipient,
        sender_id: sender,
        activity_type: activity_type,
        object_id: object_id,
        object_type: "dataset",
      },
    });
  },
);

Cypress.Commands.add("userMetadata", (name) => {
  return cy
    .request({
      method: "GET",
      url: apiUrl("user_show"),
      headers: headers,
      qs: {
        id: name,
      },
    })
    .then((res) => {
      return res.body.result;
    });
});

Cypress.Commands.add("createPendingDataset", (package_id, dataset) => {
  const request = cy.request({
    method: "POST",
    url: apiUrl("pending_dataset_create"),
    headers: headers,
    body: {
      package_id: package_id,
      package_data: dataset,
    },
  });
});

function printAccessibilityViolations(violations) {
  cy.task(
    "table",
    violations.map(({ id, impact, description, nodes }) => ({
      impact,
      description: `${description} (${id})`,
      nodes: nodes.map((el) => el.target).join(" / "),
    })),
  );
}

Cypress.Commands.add(
  "checkAccessibility",
  {
    prevSubject: "optional",
  },
  ({ skipFailures = false, context = null, options = null } = {}) => {
    //  By default, exclude CKAN debugger elements
    const defaultContext = {
      exclude: [],
    };

    if (!context) {
      context = defaultContext;
    } else {
      context = { ...defaultContext, ...context };
    }

    cy.checkA11y(
      context,
      {
        ...options,
        runOnly: {
          type: "tag",
          values: ["wcag2aa"],
        },
      },
      printAccessibilityViolations,
      skipFailures,
    );
  },
);
