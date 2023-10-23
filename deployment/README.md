## Directory Structure

The `ckan-deployment` directory contains:

- The `ckan` directory that houses the `Dockerfile` and the setup files needed for building the CKAN image.
- The `helm-templates` directory that contains all the charts and templates required for deployment.
  - All the variables are set in `values.yaml.template`, while the secrets are stored in the secret repository.

## CI/CD Pipeline

The CI/CD pipeline has two jobs defined in [main.yml](../.github/workflows/main.yml):

- **Build and Scan Image with Integration Tests**
  - This job builds the CKAN image.
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
  - Then, we deploy using Helm upgrade, which utilizes the `values.yaml` generated from `values.yaml.develop.template` after substituting the variable values.
