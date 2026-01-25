#!/bin/bash
# Script to find which ECR repo contains a specific tag
# Usage: ./find-ecr-tag.sh <tag> [profile]
# Example: ./find-ecr-tag.sh dev-latest
# Example: ./find-ecr-tag.sh dev-abc123 AWSAdministratorAccess-245948672511

TAG=${1:-"dev-latest"}
PROFILE=${2:-"AWSAdministratorAccess-245948672511"}

# ECR repositories to check
REPOS=("ckan-ecr" "frontend-ecr" "datapusher-ecr" "wri-ckan-base")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "Searching for tag: $TAG"
echo "Using profile: $PROFILE"
echo "-------------------------------------------"

found=0

for repo in "${REPOS[@]}"; do
    printf "%-20s " "$repo"
    
    # Use exit code to check if image exists
    if aws ecr describe-images \
        --repository-name "$repo" \
        --image-ids imageTag="$TAG" \
        --profile "$PROFILE" \
        --query 'imageDetails[0].imageDigest' \
        --output text > /tmp/ecr_digest_$$.txt 2>/dev/null; then
        
        digest=$(cat /tmp/ecr_digest_$$.txt)
        if [ -n "$digest" ] && [ "$digest" != "None" ]; then
            echo -e "${GREEN}✓ FOUND${NC} (digest: ${digest:0:30}...)"
            found=1
            
            # Show all tags for this image
            echo "    Other tags for this image:"
            aws ecr describe-images \
                --repository-name "$repo" \
                --image-ids imageTag="$TAG" \
                --profile "$PROFILE" \
                --query 'imageDetails[0].imageTags[]' \
                --output text 2>/dev/null | tr '\t' '\n' | sed 's/^/      - /'
        else
            echo -e "${RED}✗ NOT FOUND${NC}"
        fi
    else
        echo -e "${RED}✗ NOT FOUND${NC}"
    fi
    
    rm -f /tmp/ecr_digest_$$.txt
done

echo "-------------------------------------------"
if [ $found -eq 0 ]; then
    echo -e "${RED}Tag not found in any repository${NC}"
fi
