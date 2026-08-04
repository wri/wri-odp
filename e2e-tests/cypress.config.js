import { readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "cypress";
import installLogsPrinter from "cypress-terminal-report/src/installLogsPrinter.js";

export default defineConfig({
  chromeWebSecurity: false,
  pageLoadTimeout: 120000,
  video: false,
  env: {
    CKAN_USERNAME: "ckan_admin",
    CKAN_PASSWORD: "test1234",
    API_KEY: "CKAN_API_TOKEN",
    ORG_NAME_SUFFIX: "-organization-test",
    DATASET_NAME_SUFFIX: "-dataset-test",
    GROUP_SUFFIX: "-group-test",
    USER_NAME_SUFFIX: "-user-test",
  },
  e2e: {
    baseUrl: "http://127.0.0.1:3000",
    apiUrl: "http://ckan-dev:5000/private-admin/en",
    setupNodeEvents(on, config) {
      on("task", {
        table(violations) {
          console.table(violations);
          return null;
        },
        headlessLog({ args }) {
          console.log(...args);
          return null;
        },
        // Multipart resource_create from Node (avoids browser→minio hostname issues).
        async uploadResourceFile({
          apiUrl,
          apiKey,
          packageId,
          fixturePath,
          format,
        }) {
          const absolutePath = resolve(config.projectRoot, fixturePath);
          const fileName = absolutePath.split("/").pop();
          const bytes = readFileSync(absolutePath);
          const form = new FormData();
          form.append("package_id", packageId);
          form.append("name", fileName);
          form.append("format", format);
          form.append(
            "description",
            "Lorem Ipsum is simply dummy text of the printing and type",
          );
          form.append(
            "upload",
            new Blob([bytes], { type: "text/csv" }),
            fileName,
          );
          const res = await fetch(`${apiUrl}/api/3/action/resource_create`, {
            method: "POST",
            headers: { Authorization: apiKey },
            body: form,
          });
          const body = await res.json();
          if (!res.ok || body.success === false) {
            throw new Error(
              `resource_create failed: ${res.status} ${JSON.stringify(body.error || body)}`,
            );
          }
          return body.result;
        },
      });
      installLogsPrinter(on, {
        printLogsToConsole: 'always',
      });

      return config;
    },
  },
});
