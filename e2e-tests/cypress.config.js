import { defineConfig } from 'cypress'

export default defineConfig({
  chromeWebSecurity: false,
  pageLoadTimeout: 120000,
  video: false,
  env: {
    CKAN_USERNAME: 'luccas',
    CKAN_PASSWORD: 'gandalf@256',
    API_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkbThMeEFKQ0Y0WDFtYlhUUFpRUWliVGc4cHZBM0p5SHJWX0MtVFAtZDVnIiwiaWF0IjoxNzQyOTg5NzQ1fQ.aMVRxwhz8kjXJD9npjYhtlhVkJ9TwLj7sbV0s4c5ZpY",
    ORG_NAME_SUFFIX: '-organization-test',
    DATASET_NAME_SUFFIX: '-dataset-test',
    GROUP_SUFFIX: '-group-test',
    USER_NAME_SUFFIX: '-user-test',
  },
  e2e: {
    baseUrl: 'http://127.0.0.1:3000',
    apiUrl: 'https://wri.dev.frontend.datopian.com',
    setupNodeEvents(on, config) {
      on('task', {
        table(violations) {

          console.table(violations)
          return null
        },
      })
    },
  },
})
