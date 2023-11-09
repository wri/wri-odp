import cypress from "cypress";
import { CKANIntegrationTests } from "ckan-integration-tests";

const assets = new CKANIntegrationTests();
assets.addSpecs(".", ["ckan-classic-auth", "ckan-classic-api"]);

cypress
  .run(assets.options)
  .then((results) => {
    if (results.totalFailed > 0) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    assets.cleanUp();
  });
