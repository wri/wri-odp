#!/bin/bash

# This script is used to set up Cypress (mostly for CI testing, but you can use it for dev environments).
# It will generate a token for the ckan_admin user,
# create a Cypress config file from the example,
# and replace the token placeholder with the generated token.
# Note: This script assumes that the CKAN container is already running and the default environment variables are unchanged.

set -euo pipefail

script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$script_dir"

repo_root="$(cd "$script_dir/../../.." && pwd)"

# Generate a token
token=$(docker exec ckan-wri ckan -c production.ini user token add ckan_admin cypress \
  | awk '/API Token created:/ {getline; print $1}' \
  | tr -d '\n' | tr -d '\r')

if [ -z "$token" ]; then
  echo "ERROR: failed to generate ckan_admin API token (is container ckan-wri running?)" >&2
  exit 1
fi

echo "Generated API token for ckan_admin (length ${#token})"

# Portable in-place sed (macOS BSD sed needs '' after -i; GNU sed does not)
sed_inplace() {
  local expr="$1"
  local file="$2"
  if [[ "$(uname -s)" == "Darwin" ]]; then
    sed -i '' "$expr" "$file"
  else
    sed -i "$expr" "$file"
  fi
}

# Create a Cypress config file from the example
cp "$repo_root/integration-tests/cypress.json.example" "$repo_root/integration-tests/cypress.json"

# Replace the token placeholder (use | so JWT '/' does not break sed)
sed_inplace "s|CKAN_API_TOKEN|${token}|g" "$repo_root/integration-tests/cypress.json"
sed_inplace "s|CKAN_API_TOKEN|${token}|g" "$repo_root/e2e-tests/cypress.config.js"
sed_inplace "s|CKAN_API_TOKEN|${token}|g" "$repo_root/ckan-backend-dev/.env.example"

echo "Updated:"
echo "  - integration-tests/cypress.json"
echo "  - e2e-tests/cypress.config.js"
echo "  - ckan-backend-dev/.env.example"
echo
echo "Restart frontend so it picks up SYS_ADMIN_API_KEY:"
echo "  cd ckan-backend-dev && docker compose -f docker-compose.test.yml --env-file .env.example up -d frontend"
