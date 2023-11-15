import { defineConfig } from 'cypress'

export default defineConfig({
  chromeWebSecurity: false,
  pageLoadTimeout: 120000,
  video: false,
  env: {
    CKAN_USERNAME: 'ckan_admin',
    CKAN_PASSWORD: 'test1234',
    API_KEY: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJOR3lfYVZxU3U0REgtcjhra1E1dDhVR20yakNmYVVRcjVzRGU3NVl5amZJIiwiaWF0IjoxNzAwMDExMzc0fQ.DjhtZ78mW7xvV2KHOIqlhOlTroA99eSsQJ0LTVFr-YB2DOVhr1U5yzzGIMd7IQUbXXGwMmMD-igLWuR48eMxkZt6h0eSO7wwbxA1xDuUZcGdNw0KbYjlDH28M_hSDnQMC-ZGr0JXjEejvR2-Mu62KoYL098ee54xKHle11GSm3P9lyZDlWa_fZcGF32MrMiYC-qMsETV-UowuHadyQcIYd8We2SO9MIkWC9HMoWDw_LnwOfhUqlb0SrPHWD0lUfSGY-o1IPuDBD99u3rFXG2cnPtQ1uGaS_du2KnESukQs_oRGGTFKYFk-izqpvdQEAmx_V51kBCR9E4aBaYK2I-lg',
    ORG_NAME_SUFFIX: '-organization-test',
    DATASET_NAME_SUFFIX: '-dataset-test',
    GROUP_SUFFIX: '-group-test',
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://ckan-dev:5000',
  },
})
