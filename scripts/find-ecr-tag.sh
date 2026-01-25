#!/bin/bash
# Script to find which ECR repo contains a specific tag and show all related tags
# Usage: ./find-ecr-tag.sh <tag> [profile]
# Example: ./find-ecr-tag.sh dev-latest
# Example: ./find-ecr-tag.sh staging-latest-datapusher
# Example: ./find-ecr-tag.sh prod-latest AWSAdministratorAccess-245948672511

TAG=${1:-"dev-latest"}
PROFILE=${2:-"AWSAdministratorAccess-245948672511"}

# ECR repositories to check
REPOS=("ckan-ecr" "frontend-ecr" "datapusher-ecr")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo "Searching for tag: $TAG"
echo "Using profile: $PROFILE"
echo "-------------------------------------------"

found=0

for repo in "${REPOS[@]}"; do
    printf "%-20s " "$repo"
    
    # Use exit code and check output
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
            all_tags=$(aws ecr describe-images \
                --repository-name "$repo" \
                --image-ids imageTag="$TAG" \
                --profile "$PROFILE" \
                --query 'imageDetails[0].imageTags[]' \
                --output text 2>/dev/null)
            
            # Determine the branch from the tag (dev, staging, prod)
            if [[ "$TAG" == dev* ]]; then
                BRANCH="dev"
            elif [[ "$TAG" == staging* ]]; then
                BRANCH="staging"
            elif [[ "$TAG" == prod* ]]; then
                BRANCH="prod"
            else
                BRANCH=""
            fi
            
            sha_tag=""
            for t in $all_tags; do
                # Check if this is a SHA tag (branch-40hexchars or branch-40hexchars-suffix)
                if [[ -n "$BRANCH" ]] && echo "$t" | grep -qE "^${BRANCH}-[a-f0-9]{40}(-[a-z]+)?$"; then
                    echo -e "      - $t ${YELLOW}← SHA tag${NC}"
                    sha_tag="$t"
                else
                    echo "      - $t"
                fi
            done
            
            if [ -n "$sha_tag" ]; then
                echo -e "    ${GREEN}Use this for deployment: $sha_tag${NC}"
            fi
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
