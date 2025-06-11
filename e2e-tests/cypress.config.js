import { defineConfig } from 'cypress'

export default defineConfig({
  chromeWebSecurity: false,
  pageLoadTimeout: 120000,
  video: false,
  env: {
    CKAN_USERNAME: 'ckan_admin',
    CKAN_PASSWORD: 'test1234',
    API_KEY: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjc1FXeVRlaElhUld2cXVidFc1czNqSmlCdDdlSWdibklzQktQWlVxMkJzIiwiaWF0IjoxNzQ5NjUwNTAxfQ.Sf_SqtVrkcPehOJGDAf30PktXtCJgoUTInqugRRT7GN0VAvBbTyNsHJ67B_rZ9yNlu25x4vaJPgmRNIK8ZsPyxl0WtCwVZOi_Gv_x9Jm9yHVMFhuKW2UK0_CjxLbKOOIEhezws4cGWYXNC68iUkB3FWs0BlXYpuMZAZrqLmfCEKC5Yk3n9evrxv_LMhxzhI72S8bYVLXlBBPXlr3hucU54U9L_voMgGzfSFoMQKiwseAW3LBLh7aipKDtMPrBVLo3THfyvecYVHOnls8f-OjgYK0pXxTzLR1wdGgkNytCbG1zGiE-0P-qeBbYhdnwI1ACcF52k6HHGAH2nMA6rTn0w",
    ORG_NAME_SUFFIX: '-organization-test',
    DATASET_NAME_SUFFIX: '-dataset-test',
    GROUP_SUFFIX: '-group-test',
    USER_NAME_SUFFIX: '-user-test',
  },
  e2e: {
    baseUrl: 'http://127.0.0.1:3000',
    apiUrl: 'http://ckan-dev:5000/private-admin/en',
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
