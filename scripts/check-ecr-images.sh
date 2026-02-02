#!/bin/bash
# Script to check what images would be deployed for an environment
# Shows the SHA tags that the latest tags resolve to
# Usage: ./check-ecr-images.sh [branch] [profile]
# Example: ./check-ecr-images.sh dev
# Example: ./check-ecr-images.sh staging
# Example: ./check-ecr-images.sh prod

BRANCH=${1:-"dev"}
PROFILE=${2:-"AWSAdministratorAccess-245948672511"}

# ECR repositories
CKAN_REPO="ckan-ecr"
FRONTEND_REPO="frontend-ecr"
DATAPUSHER_REPO="datapusher-ecr"
SOLR_REPO="solr"
PREFECT_REPO="prefect"
POSTGRESQL_REPO="postgresql"
MIGRATION_REPO="migration"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo "=========================================="
echo "Resolving deployment tags for: $BRANCH"
echo "Profile: $PROFILE"
echo "=========================================="
echo ""

# Function to resolve SHA tag from latest tag
resolve_sha_tag() {
    local repo=$1
    local latest_tag=$2
    local sha_pattern=$3
    local service_name=$4
    
    printf "%-15s " "$service_name"
    
    # Get digest
    digest=$(aws ecr describe-images \
        --repository-name "$repo" \
        --image-ids imageTag="$latest_tag" \
        --profile "$PROFILE" \
        --query 'imageDetails[0].imageDigest' \
        --output text 2>/dev/null)
    
    if [ -z "$digest" ] || [ "$digest" == "None" ]; then
        echo -e "${RED}✗ Latest tag not found: $latest_tag${NC}"
        return 1
    fi
    
    # Get all tags for this digest
    all_tags=$(aws ecr describe-images \
        --repository-name "$repo" \
        --image-ids imageDigest="$digest" \
        --profile "$PROFILE" \
        --query 'imageDetails[0].imageTags[]' \
        --output text 2>/dev/null)
    
    # Find SHA tag
    sha_tag=$(echo "$all_tags" | tr '\t' '\n' | grep -E "$sha_pattern" | head -1)
    
    if [ -z "$sha_tag" ]; then
        echo -e "${YELLOW}⚠ No SHA tag found, only: $latest_tag${NC}"
        echo "    Available tags: $all_tags"
        return 0
    fi
    
    echo -e "${GREEN}✓ $sha_tag${NC}"
    echo "    (from $latest_tag)"
    return 0
}

echo "Resolving image tags from ECR latest tags:"
echo "-------------------------------------------"

# CKAN (pattern: branch-sha, no suffix)
resolve_sha_tag "$CKAN_REPO" "${BRANCH}-latest" "^${BRANCH}-[a-f0-9]{40}$" "CKAN"

# Frontend (pattern: branch-sha, no suffix)
resolve_sha_tag "$FRONTEND_REPO" "${BRANCH}-latest" "^${BRANCH}-[a-f0-9]{40}$" "Frontend"

# Datapusher (pattern: branch-sha-datapusher)
resolve_sha_tag "$DATAPUSHER_REPO" "${BRANCH}-latest-datapusher" "^${BRANCH}-[a-f0-9]{40}-datapusher$" "Datapusher"

# Migration (pattern: sha only, no branch prefix)
resolve_sha_tag "$MIGRATION_REPO" "${BRANCH}" "^[a-fA-F0-9]{40}$" "Migration"

# Prefect (pattern: sha only, no branch prefix)
resolve_sha_tag "$PREFECT_REPO" "${BRANCH}" "^[a-fA-F0-9]{40}$" "Prefect"

# PostgreSQL (pattern: sha only, no branch prefix)
resolve_sha_tag "$POSTGRESQL_REPO" "${BRANCH}" "^[a-fA-F0-9]{40}$" "PostgreSQL"

# Solr (pattern: sha only, no branch prefix)
resolve_sha_tag "$SOLR_REPO" "${BRANCH}" "^[a-fA-F0-9]{40}$" "Solr"

echo ""
echo "=========================================="
echo "These are the tags that would be deployed"
echo "=========================================="
