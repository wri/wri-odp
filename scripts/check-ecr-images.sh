#!/bin/bash
# Script to check if ECR images exist for a given SHA
# Usage: ./check-ecr-images.sh <sha> [branch] [profile]
# Example: ./check-ecr-images.sh b75eb2d2786601b5aea9a05ed1e2875d19d51cf8 dev

SHA=${1:-"b75eb2d2786601b5aea9a05ed1e2875d19d51cf8"}
BRANCH=${2:-"dev"}
PROFILE=${3:-"AWSAdministratorAccess-245948672511"}

# ECR repositories
CKAN_REPO="ckan-ecr"
FRONTEND_REPO="frontend-ecr"
DATAPUSHER_REPO="datapusher-ecr"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "=========================================="
echo "Checking ECR images for SHA: $SHA"
echo "Branch: $BRANCH"
echo "Profile: $PROFILE"
echo "=========================================="
echo ""

check_image() {
    local repo=$1
    local tag=$2
    local description=$3
    
    printf "%-15s %-55s " "$description" "$tag"
    
    # Use exit code and check output
    if aws ecr describe-images \
        --repository-name "$repo" \
        --image-ids imageTag="$tag" \
        --profile "$PROFILE" \
        --query 'imageDetails[0].imageDigest' \
        --output text > /tmp/ecr_check_$$.txt 2>/dev/null; then
        
        digest=$(cat /tmp/ecr_check_$$.txt)
        if [ -n "$digest" ] && [ "$digest" != "None" ]; then
            echo -e "${GREEN}✓ EXISTS${NC}"
            rm -f /tmp/ecr_check_$$.txt
            return 0
        fi
    fi
    
    echo -e "${RED}✗ NOT FOUND${NC}"
    rm -f /tmp/ecr_check_$$.txt
    return 1
}

echo "Checking SHA-tagged images:"
echo "-------------------------------------------"

missing=0

check_image "$CKAN_REPO" "${BRANCH}-${SHA}" "CKAN" || ((missing++))
check_image "$FRONTEND_REPO" "${BRANCH}-${SHA}" "Frontend" || ((missing++))
check_image "$DATAPUSHER_REPO" "${BRANCH}-${SHA}-datapusher" "Datapusher" || ((missing++))
check_image "$DATAPUSHER_REPO" "${BRANCH}-${SHA}-migration" "Migration" || ((missing++))

echo ""
echo "Checking latest-tagged images:"
echo "-------------------------------------------"

check_image "$CKAN_REPO" "${BRANCH}-latest" "CKAN"
check_image "$FRONTEND_REPO" "${BRANCH}-latest" "Frontend"
check_image "$DATAPUSHER_REPO" "${BRANCH}-latest-datapusher" "Datapusher"
check_image "$DATAPUSHER_REPO" "${BRANCH}-latest-migration" "Migration"

echo ""
echo "=========================================="
if [ $missing -gt 0 ]; then
    echo -e "${RED}$missing SHA-tagged image(s) missing!${NC}"
    echo ""
    echo "This means the build was skipped for these services."
    echo "The deployment should use 'latest' tags instead."
else
    echo -e "${GREEN}All SHA-tagged images exist!${NC}"
fi
echo "=========================================="
