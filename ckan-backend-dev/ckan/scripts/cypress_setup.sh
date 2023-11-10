#!/bin/bash

# This script is used to set up Cypress (mostly for CI testing, but you can use it for dev environments).
# It will generate a token for the ckan_admin user,
# create a Cypress config file from the example,
# and replace the token placeholder with the generated token.
# Note: This script assumes that the CKAN container is already running and the default environment variables are unchanged.

script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$script_dir"

# Generate a token
token=$(docker exec ckan-wri ckan -c production.ini user token add ckan_admin cypress | awk '/API Token created:/ {getline; print $1}' | tr -d '\n' | tr -d '\r')

# Create a Cypress config file from the example
cp ../../../integration-tests/cypress.json.example ../../../integration-tests/cypress.json

# Replace the token placeholder with the generated token
sed -i "s/CKAN_API_TOKEN/$token/g" ../../../integration-tests/cypress.json
sed -i "s/CKAN_API_TOKEN/$token/g" ../../../e2e-tests/cypress.config.js
sed -i "s/CKAN_API_TOKEN/$token/g" ../../.env.example
