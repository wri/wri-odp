import { defineConfig } from 'cypress'

export default defineConfig({
  chromeWebSecurity: false,
  pageLoadTimeout: 120000,
  video: false,
  env: {
    CKAN_USERNAME: 'ckan_admin',
    CKAN_PASSWORD: 'test1234',
    API_KEY: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJLX1NNSzVaM1VGc3NPaXFyck9NVm91Ykl0M19BMDFJYjU5UkU3Ump1dFgwIiwiaWF0IjoxNjk5ODg3NjAzfQ.lbbnC3dG0JtNEgN-gS_5q1mwTSeGEyjP6YWt7l_xBIhO9LY-UWjlBXq4O0s0aLgH8QfT0L8qmIL_BC2CNxKhW5n2De2sO1yZgvLsmywXQisM3wAYpxoa-OaoUsXGzZSC6UhRYuccMcKxA6B_SUSPmJ1I8L2s5Bvy25A7b7PF7uh6wplvkIM7ABPfF0YF9bkRWAax3oo_2wpJsnB9rpAA7fLFt8k9W52pNvWPGREijiteHIqrVsuAKnTdfQg7YC7hi1hzdsVM1Tz7U5y7Q0Isf3FvGZmA2Y8nQQd4JskotS0XqF2z-j2pzyvahqZWZQc1vmVB-_21M4smUcbEt60Jsw',
    ORG_NAME_SUFFIX: '-organization-test',
    DATASET_NAME_SUFFIX: '-dataset-test',
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://ckan-dev:5000',
  },
})
