#!/bin/bash
env=dev
PROFILE=${AWS_PROFILE:-"AWSAdministratorAccess-245948672511"}

# ECR repositories
REGISTRY="245948672511.dkr.ecr.us-east-1.amazonaws.com"
CKAN_REPO="ckan-ecr"
FRONTEND_REPO="frontend-ecr"
DATAPUSHER_REPO="datapusher-ecr"
MIGRATION_REPO="migration"

# Function to get SHA tag from a "latest" tag (e.g., "dev")
# SHA tags can be: plain 40 hex (54e732...), or 40hex-branch (64df05...-dev)
get_sha_tag() {
    local repo=$1
    local latest_tag=$2

    all_tags=$(aws ecr describe-images \
        --repository-name "$repo" \
        --image-ids imageTag="$latest_tag" \
        --profile "$PROFILE" \
        --query 'imageDetails[0].imageTags[]' \
        --output text 2>/dev/null)

    if [ -z "$all_tags" ]; then
        echo ""
        return 1
    fi

    # Find SHA tag: plain 40 hex chars, or 40hex-branch (e.g. 64df05...-dev)
    sha_tag=""
    for t in $all_tags; do
        if echo "$t" | grep -qE "^[a-f0-9]{40}$" || echo "$t" | grep -qE "^[a-f0-9]{40}-${latest_tag}$"; then
            sha_tag="$t"
            break
        fi
    done

    echo "$sha_tag"
}

echo "Fetching SHA tags from ECR for '$env' tagged images..."
echo "Using profile: $PROFILE"
echo "-------------------------------------------"

# Get SHA tags for each image
CKAN_SHA=$(get_sha_tag "$CKAN_REPO" $env)
FRONTEND_SHA=$(get_sha_tag "$FRONTEND_REPO" $env)
DATAPUSHER_SHA=$(get_sha_tag "$DATAPUSHER_REPO" $env)
MIGRATION_SHA=$(get_sha_tag "$MIGRATION_REPO" $env)

# Validate we got all SHA tags
missing=0
if [ -z "$CKAN_SHA" ]; then
    echo "ERROR: Could not find SHA tag for CKAN ($env)"
    missing=1
fi
if [ -z "$FRONTEND_SHA" ]; then
    echo "ERROR: Could not find SHA tag for Frontend ($env)"
    missing=1
fi
if [ -z "$DATAPUSHER_SHA" ]; then
    echo "ERROR: Could not find SHA tag for Datapusher ($env)"
    missing=1
fi
if [ -z "$MIGRATION_SHA" ]; then
    echo "ERROR: Could not find SHA tag for Migration ($env)"
    missing=1
fi

if [ $missing -eq 1 ]; then
    echo "-------------------------------------------"
    echo "Some SHA tags could not be resolved. Aborting."
    exit 1
fi

echo "Resolved SHA tags:"
echo "  CKAN:       $CKAN_SHA"
echo "  Frontend:   $FRONTEND_SHA"
echo "  Datapusher: $DATAPUSHER_SHA"
echo "  Migration:  $MIGRATION_SHA"
echo "-------------------------------------------"

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Paths relative to project root
HELM_DIR="$PROJECT_ROOT/deployment/helm-templates"
VALUES_TEMPLATE="$HELM_DIR/values.yaml.$env.template"
VALUES_OUTPUT="$HELM_DIR/values.yaml"

curl -sS https://raw.githubusercontent.com/datopian/devops-tools/master/scripts/templater.sh > /tmp/templater.sh

# Set the required environment variables
export REGISTRY="$REGISTRY"
export CKAN_REPO="$CKAN_REPO"
export FRONTEND_REPO="$FRONTEND_REPO"
export DATAPUSHER_REPO="$DATAPUSHER_REPO"
export MIGRATION_REPO="$MIGRATION_REPO"
export CKAN_IMAGE_TAG="$CKAN_SHA"
export FRONTEND_IMAGE_TAG="$FRONTEND_SHA"
export DATAPUSHER_IMAGE_TAG="$DATAPUSHER_SHA"
export MIGRATION_IMAGE_TAG="$MIGRATION_SHA"

# Generate values.yaml from template
bash /tmp/templater.sh "$VALUES_TEMPLATE" > "$VALUES_OUTPUT"

echo ""
echo "Generated values.yaml with SHA tags"
echo "  Template: $VALUES_TEMPLATE"
echo "  Output:   $VALUES_OUTPUT"
echo "-------------------------------------------"
echo "You can now deploy the release with:"
echo "helm upgrade -i dx-helm-wri-$env-release $HELM_DIR -f $VALUES_OUTPUT -n wri-odp-$env --create-namespace --wait --timeout 7m"
echo "-------------------------------------------"