import cypress from "cypress";
import { CKANIntegrationTests } from "ckan-integration-tests";

const assets = new CKANIntegrationTests();
assets.addSpecs(".", ["ckan-classic-auth", "ckan-classic-api"]);

cypress
  .run(assets.options)
  .then(r => {
    console.log(r)
    assets.cleanUp()

    // if the cypress tests fail to run, log the error
    if (r.failures) {
      console.error('Could not execute cypress tests')
      console.error(r.message)
      process.exit(1)
    }
    // return exit code of 1 if any tests fail
    r.totalFailed ? process.exit(1) : process.exit(0)
  })
  .catch(e => {
    console.error(e.message)
    process.exit(1)
  });
