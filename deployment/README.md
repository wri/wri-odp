## Directory Structure

The `datapusher` directory contains:
- Dockerfile for building the datapusher container that run the prefect jobs for the datapusher.
- All the prefect tasks and config files.

The `deployment` directory contains:

- The `ckan` directory that houses the `Dockerfile` and the setup files needed for building the CKAN image.
- The `frontend` directory that houses the `Dockerfile` and the setup files needed for building the Frontend image.
- The `helm-templates` directory that contains all the charts and templates required for deployment.
  - All the variables are set in `values.yaml.template`, while the secrets are stored in the [secrets repository](https://github.com/wri/wri-odp-secrets/tree/main/k8s-secrets).

## CI/CD Pipeline

The CI/CD pipeline has two jobs defined in [main.yml](../.github/workflows/main.yml):

- **Build and Scan Image with Integration Tests**
  - This job builds the CKAN, Frontend and Datapusher image.
  - Pushes the image to ECR.
  - Sets up Docker containers to perform integration and unit tests in a disposable environment using the CKAN image that was built earlier.
  - Performs Integration tests:
    - Installs Cypress dependencies.
    - Runs a script to add an API Token for the CKAN user running in the container for integration tests that require authorization.
  - Performs unit tests:
    - Uses Minio for s3filestore unit testing.
    - Runs the tests.
  - Runs a container vulnerability scanner based on Trivy.

- **Deploy To AWS**
  - Once the "Build and Scan Image with Integration Tests" job passes, the deployment process is initiated.
  - We log into AWS and ECR using OIDC roles and configure kubeconfig.
<<<<<<< HEAD
  - Then, we deploy using Helm upgrade, which utilizes the `values.yaml` generated from `values.yaml.prod.template` after substituting the variable values.
=======
  - Then, we deploy using Helm upgrade, which utilizes the `values.yaml` generated from `values.yaml.develop.template` after substituting the variable values.


## Solr Schema Update

**Important Note:** Updating the Solr schema is typically only required during development or on the first boot of Solr.

### Schema Update:

If changes have been made to the schema that need to be applied, update the files [solr/config/managed-schema](./solr/config/managed-schema) and [solr/config/schema.xml](./solr/config/schema.xml) with your modified schema file located at [schema.xml](./ckan-backend-dev/ckan/setup/schema.xml).

### Initializing Solr:

Create an archive of the Solr init package:

```bash
cd /solr/config
zip -r - * > /tmp/ckan_default.zip
```

Identify the Solr pod and copy the archive:

<namespace>: The namespace where your project assets are grouped (e.g., wri-odp-dev).
<pod-name>: The name of the pod running Solr, obtained using kubectl get pods.

```bash
kubectl get pods -n <namespace>
kubectl cp -n <namespace> /tmp/ckan_default.zip <pod-name>:/tmp
```

Execute commands within the Solr pod:

```bash
kubectl exec -it -n <namespace> <pod-name> -- bash
```

Inside the container, upload the zip file to Solr:

```bash
curl -X POST \
  --header "Content-Type:application/octet-stream" \
  --data-binary @- \
  "http://localhost:8983/solr/admin/configs?action=UPLOAD&name=ckan_28_default" < /tmp/ckan_default.zip
```

Create the Solr collection:

```bash
curl -v "http://localhost:8983/solr/admin/collections?action=CREATE&name=ckan&collection.configName=ckan_28_default&replicationFactor=3&numShards=1"
```

### CKAN Secret Update

Once the collection is created, update the CKAN_SOLR_URL secret in CKAN to use the new collection name:

```
CKAN_SOLR_URL: http://solr-url/solr/ckan
```
Where `ckan` is name of newly created collection
>>>>>>> staging
