
helm get manifest dx-helm-wri-dev-release -n wri-odp-dev | grep "image:" | sort -u


### Get the history of releases helm
env=dev; helm history dx-helm-wri-$env-release -n wri-odp-$env

## images used for particular revision
env=staging; helm get manifest dx-helm-wri-$env-release -n wri-odp-$env --revision 12 | grep "image:"

## differences between releases
diff <(helm get manifest dx-helm-wri-dev-release -n wri-odp-dev --revision 752 | grep "image:") \
     <(helm get manifest dx-helm-wri-dev-release -n wri-odp-dev --revision 753 | grep "image:")

## differences between releases
diff <(helm get manifest dx-helm-wri-dev-release -n wri-odp-dev --revision 755) \
     <(helm get manifest dx-helm-wri-dev-release -n wri-odp-dev --revision 756)



## rollback
env=prod; helm history dx-helm-wri-$env-release -n wri-odp-$env
env=prod helm rollback dx-helm-wri-$env-release 8 -n wri-odp-$env


kubectl get events -n wri-odp-prod --watch


git diff c26cbf26 5c3a3b7c

for repo in ckan-ecr frontend-ecr datapusher-ecr wri-ckan-base; do
  aws ecr put-lifecycle-policy --repository-name $repo --lifecycle-policy-text '{
    "rules": [
      {
        "rulePriority": 1,
        "description": "Keep latest tags forever (10 years)",
        "selection": {
          "tagStatus": "tagged",
          "tagPatternList": ["*latest*"],
          "countType": "sinceImagePushed",
          "countUnit": "days",
          "countNumber": 3650
        },
        "action": {"type": "expire"}
      },
      {
        "rulePriority": 2,
        "description": "Delete other tagged images after 1 day",
        "selection": {
          "tagStatus": "tagged",
          "tagPatternList": ["*"],
          "countType": "sinceImagePushed",
          "countUnit": "days",
          "countNumber": 1
        },
        "action": {"type": "expire"}
      },
      {
        "rulePriority": 3,
        "description": "Delete untagged images after 1 day",
        "selection": {
          "tagStatus": "untagged",
          "countType": "sinceImagePushed",
          "countUnit": "days",
          "countNumber": 1
        },
        "action": {"type": "expire"}
      }
    ]
  }' --profile AWSAdministratorAccess-245948672511
  echo "Updated $repo"
done


./scripts/find-ecr-tag.sh dev-latest
./scripts/find-ecr-tag.sh dev-latest-datapusher
./scripts/find-ecr-tag.sh dev-latest-migration

./scripts/find-ecr-tag.sh staging-latest
./scripts/find-ecr-tag.sh staging-latest-datapusher
./scripts/find-ecr-tag.sh staging-latest-migration



## get values

# Set the environment variable (e.g., dev, staging, prod)

env=dev

helm get values dx-helm-wri-$env-release -n wri-odp-$env > ./deployment/helm-templates/values.yaml
helm get values dx-helm-wri-$env-release -n wri-odp-$env --all > ./deployment/helm-templates/values.yaml

cd deployment

curl -sS https://raw.githubusercontent.com/datopian/devops-tools/master/scripts/templater.sh > /tmp/templater.sh

# Set the required environment variables
export REGISTRY="245948672511.dkr.ecr.us-east-1.amazonaws.com"
export CKAN_REPO="ckan-ecr"
export FRONTEND_REPO="frontend-ecr"
export DATAPUSHER_REPO="datapusher-ecr"
export MIGRATION_REPO="migration"
export CKAN_IMAGE_TAG="dev"
export FRONTEND_IMAGE_TAG="dev"
export DATAPUSHER_IMAGE_TAG="dev"
export MIGRATION_IMAGE_TAG="dev"


# Generate values.yaml from template
bash /tmp/templater.sh helm-templates/values.yaml.$env.template > helm-templates/values.yaml

cd ..

BRANCH_NAME=prod
helm upgrade -i dx-helm-wri-$BRANCH_NAME-release ./deployment/helm-templates \
  -f ./deployment/helm-templates/values.yaml \
  -n wri-odp-$BRANCH_NAME \
  --create-namespace \
  --wait \
  --timeout 7m



kubectl apply -f wri-staging-ckan-envvars.yaml
kubectl apply -f wri-staging-migration-app-envvars.yaml
kubectl apply -f wri-staging-frontend-envvars.yaml
kubectl apply -f wri-staging-datapusher-envvars.yaml 


curl -X POST "http://localhost:4200/api/block_documents/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ckan-api-key-dev",
    "data": {"value": "CKAN_API_KEY"},
    "block_type_slug": "secret"
  }'


kubectl get secret wri-prod-ckan-envvars -n wri-odp-staging -o jsonpath='{.data.CKAN_SYSADMIN_API_TOKEN}' | base64 -d


env=prod; helm rollback dx-helm-wri-$env-release 761 -n wri-odp-$env 



kubectl exec -it <ckan-pod-name> -n wri-odp-dev -- nslookup dx-ckan-db.c4kwwxkflspg.us-east-1.rds.amazonaws.com

kubectl exec -it <ckan-pod-name> -n wri-odp-dev -- env | grep -i sql

