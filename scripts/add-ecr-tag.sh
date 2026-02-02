#!/bin/bash
# Script to add a new tag to an existing ECR image
# Usage: ./add-ecr-tag.sh <repo> <existing_tag> <new_tag> [profile]
# Example: ./add-ecr-tag.sh solr-ecr 47cf0d2402fbe0aece23fdfed71a0df3f2e8e661 dev
# Example: ./add-ecr-tag.sh ckan-ecr dev-latest prod-latest AWSAdministratorAccess-245948672511

set -e

REPO=${1}
EXISTING_TAG=${2}
NEW_TAG=${3}
PROFILE=${4:-"AWSAdministratorAccess-245948672511"}

if [ -z "$REPO" ] || [ -z "$EXISTING_TAG" ] || [ -z "$NEW_TAG" ]; then
    echo "Usage: $0 <repo> <existing_tag> <new_tag> [profile]"
    echo "Example: $0 solr-ecr 47cf0d2402fbe0aece23fdfed71a0df3f2e8e661 dev"
    exit 1
fi

echo "Adding tag '$NEW_TAG' to image '$REPO:$EXISTING_TAG'"
echo "Profile: $PROFILE"
echo ""

# Get the image manifest
echo "Fetching manifest for $REPO:$EXISTING_TAG..."
MANIFEST=$(aws ecr batch-get-image \
    --repository-name "$REPO" \
    --image-ids imageTag="$EXISTING_TAG" \
    --profile "$PROFILE" \
    --query 'images[0].imageManifest' \
    --output text)

if [ -z "$MANIFEST" ] || [ "$MANIFEST" == "None" ]; then
    echo "Error: Could not find image with tag '$EXISTING_TAG' in repository '$REPO'"
    exit 1
fi

echo "Found image, applying new tag '$NEW_TAG'..."

# Put the image with the new tag
aws ecr put-image \
    --repository-name "$REPO" \
    --image-tag "$NEW_TAG" \
    --image-manifest "$MANIFEST" \
    --profile "$PROFILE" \
    --output text > /dev/null

echo ""
echo "✓ Successfully tagged $REPO:$EXISTING_TAG as $REPO:$NEW_TAG"
