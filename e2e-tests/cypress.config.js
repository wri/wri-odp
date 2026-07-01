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
      });
      installLogsPrinter(on, {
        printLogsToConsole: 'always',
      });

      // Headless CI runners typically have no real GPU, which makes
      // WebGL-heavy pages (Mapbox GL maps/legends) render extremely slowly
      // or spam "GPU stall due to ReadPixels" warnings. Forcing a software
      // WebGL fallback keeps rendering fast/stable instead of relying on
      // (missing) hardware acceleration.
      on("before:browser:launch", (browser = {}, launchOptions) => {
        if (browser.family === "chromium") {
          launchOptions.args.push("--use-gl=swiftshader");
          launchOptions.args.push("--enable-unsafe-swiftshader");
          launchOptions.args.push("--ignore-gpu-blocklist");
          launchOptions.args.push("--disable-gpu-sandbox");
        }
        return launchOptions;
      });

      return config;
    },
  },
});
