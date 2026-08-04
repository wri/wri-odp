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
// Ignore uncaught exceptions from Osano/Hotjar which are not critical for tests

Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore Osano-related errors (cookie consent manager not loaded in test environment)
  if (err.message.includes('Osano is not defined') || err.message.includes('Osano')) {
    return false;
  }
  // Ignore Hotjar-related errors
  if (err.message.includes('hj is not defined') || err.message.includes('Hotjar')) {
    return false;
  }
  // Let other errors fail the test
  return true;
});

import 'cypress-terminal-report/src/installLogsCollector';
import "cypress-axe";
import 'cypress-plugin-tab';

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
    cy.on('window:before:load', (win) => {
      const origAppendChild = win.document.head.appendChild;
      win.document.head.appendChild = function(el) {
        if (el.tagName === 'SCRIPT' && el.src && el.src.includes('osano')) {
          return; // block injection
        }
        return origAppendChild.call(this, el);
      };
    });
    cy.visit("/");
    cy.get('body').then(($body) => {
      if ($body.find('.osano-cm-manage').length) {
        cy.get('.osano-cm-manage').click({ force: true });
        cy.contains('button', 'Save').click({ force: true });
      }
    });
    cy.get("#nav-login-button").click();
    cy.get("#login-modal").as("login-modal");

    cy.get("@login-modal").get('input[name="username"]').type(username);
    cy.get("@login-modal").get('input[name="password"]').type(password);

    cy.get("button#login-button").click({ force: true });
    cy.get("#nav-user-menu", { timeout: 30000 }).should("be.visible");
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
      '[title="Link to a URL on the internet (you can also link to an API)"]'
    ).click();
    cy.get("#field-image-url")
      .clear()
      .type(
        "https://raw.githubusercontent.com/datapackage-examples/sample-csv/master/sample.csv"
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
Cypress.Commands.add("createOrganizationAPI", (name, visibility = "public", parent = null) => {
  cy.request({
    method: "POST",
    url: apiUrl("organization_create"),
    headers: headers,
    body: parent
      ? {
          name: name,
          title: name,
          description: "Some organization description",
          visibility: visibility,
          groups: [{ name: parent }],
        }
      : {
          name: name,
          title: name,
          description: "Some organization description",
          visibility: visibility,
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
        role: role,
      },
    });
  }
);

// Command for frontend test sepecific
Cypress.Commands.add("createGroupAPI", (name, parent = null) => {
  cy.request({
    method: "POST",
    url: apiUrl("group_create"),
    headers: headers,
    body: parent
      ? {
          name: name,
          title: name,
          description: "Some sub-topic description",
          groups: [{ name: parent }],
        }
      : {
          name: name,
          title: name,
          description: "Some group description",
        },
  });
});

// Command for frontend test sepecific
Cypress.Commands.add("createApplicationAPI", (name) => {
  cy.request({
    method: "POST",
    url: apiUrl("group_create"),
    headers: headers,
    body: {
      name: name,
      title: name,
      description: "Some group description",
      contact_url: "https://contact.com",
      homepage_url: "https://homepage.com",
      help_url: "https://help.com",
      type: "application",
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
        technical_notes: "http://example.com/technical_notes.pdf",
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
  }
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
  return cy.fixture(`${file}`, "binary").then((binary) => {
    const blob = Cypress.Blob.binaryStringToBlob(binary);
    const data = new FormData();
    data.append("package_id", `${dataset}`);
    data.append("name", `${file}`);
    data.append("format", `${format}`);
    data.append(
      "description",
      "Lorem Ipsum is simply dummy text of the printing and type"
    );
    data.append("upload", blob, `${file}`);
    return cy.window().then(
      () =>
        new Cypress.Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.withCredentials = true;
          xhr.open("POST", apiUrl("resource_create"));
          xhr.setRequestHeader("Authorization", headers.Authorization);
          xhr.onload = () => {
            let body = {};
            try {
              body = JSON.parse(xhr.responseText || "{}");
            } catch (e) {
              /* ignore */
            }
            if (xhr.status >= 200 && xhr.status < 300 && body.success !== false) {
              resolve(body);
            } else {
              reject(
                new Error(
                  `resource_create failed: ${xhr.status} ${xhr.responseText}`
                )
              );
            }
          };
          xhr.onerror = () =>
            reject(new Error("resource_create network error"));
          xhr.send(data);
        })
    );
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
    $iframe.on("load", () => resolve(findBody()))
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
  }
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
  }
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
  }
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
    }))
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
      skipFailures
    );
  }
);

Cypress.Commands.add('tabTo', (opts = {}) => {
  /* Tabs through the page until the element matching `selector` is focused,
  or tabs `numberOfTabs` times. If both are provided, it will tab the given number of times
  and then assert that the given selector is focused.

  Usage:
    cy.tabTo({ selector: '#team' })
    cy.tabTo({ selector: '#team', numberOfTabs: 5 })
    cy.tabTo({ numberOfTabs: 5 })

  Options:
    - selector: (string) CSS selector of the element to focus
    - numberOfTabs: (number) Number of times to tab
    - max: (number, default 100) Maximum number of tabs to perform when searching
      for the selector. Prevents infinite loops if the selector is not found.
      Ignored if numberOfTabs is provided.
  */
  const { selector, numberOfTabs = 0, max = 100 } = opts;
  if (!selector && numberOfTabs === 0) throw new Error('tabTo: selector or numberOfTabs required');

  const ensureAnchor = () =>
    cy.window({ log: false }).then(w => { if (!w.document.hasFocus()) w.focus(); })
      .then(() => cy.document({ log: false }).then(doc => {
        return (doc.activeElement && doc.activeElement !== doc.body)
          ? cy.wrap(doc.activeElement, { log: false })
          : cy.get('body', { log: false }).click('topLeft', { force: true });
      }));

  const tabNFrom = (startChain, n) => {
    let c = startChain;
    for (let i = 0; i < n; i++) c = c.tab();
    return c;
  };

  if (numberOfTabs > 0) {
    return ensureAnchor()
      .then(() => cy.focused())
      .then($start => {
        const r = tabNFrom(cy.wrap($start), numberOfTabs);
        return selector ? r.should('match', selector) : r;
      });
  }

  return ensureAnchor().then(() => {
    const step = (i = 0) =>
      cy.focused().then($el => {
        if ($el.is(selector)) return cy.wrap($el);
        if (i >= max) throw new Error(`tabTo(${selector}) exceeded ${max} tabs`);
        return cy.wrap($el).tab().then(() => step(i + 1));
      });
    return step();
  });
});

Cypress.Commands.add('headlessLog', (...args) => {
  /* Outputs debug information to the terminal.
  Should work similarly to `console.log`.

  Example usage:
    const datasetTitle = "Dataset Test " + Math.random().toString(36).slice(2);
    cy.debugLog("Dataset Title: ", datasetTitle);

  Example output:
    Dataset Title: Dataset Test 1a2b3c4d5e6f7g8h9i0j
  */
  cy.task('headlessLog', { args });
});

Cypress.Commands.add('dumpFocus', (label = '') => {
  /* Output info about the currently focused element to the terminal and take a screenshot of the current step.
  The screenshot is saved to the default screenshots folder with the name 'step-N.png'.
  Useful for debugging tabbing sequences or other focus-related issues in headless mode.

  It also highlights the focused element with a red outline and takes a screenshot of the viewport at every step.

  Example usage:
    cy.get('input[name=title]').click().realPress([...datasetName]);
    cy.dumpFocus("after dataset title");

  Example output:
    STEP "after dataset title": {
      "tag": "INPUT",
      "id": null,
      "name": "name",
      "role": null,
      "tabIndex": 0,
      "text": "",
      "class": "shadow-wri-small block w-full rounded-md border-0 px-5 py-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 disabled:bg-gray-100 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6 min-w-0 pl-[5.9rem] sm:pl-[5.6rem] md:pl-[5.2rem] lg:pl-[5.4rem]"
    }
  */
  cy.document({ log: false }).then(doc => {
    const el = doc.activeElement;
    const info = el && el !== doc.body ? {
      tag: el.tagName,
      id: el.id || null,
      name: el.getAttribute('name'),
      role: el.getAttribute('role'),
      tabIndex: el.tabIndex,
      text: (el.innerText || '').slice(0, 80),
      class: el.className,
    } : 'BODY/none';

    if (el && el.style) {
      el.dataset.__oldOutline = el.style.outline || '';
      el.style.outline = '3px solid red';
    }

    cy.headlessLog(`${label}:`, info);
    cy.screenshot(`step-${label}`, { capture: 'viewport' }).then(() => {
      if (el && el.style) el.style.outline = el.dataset.__oldOutline || '';
    });
  });
});
