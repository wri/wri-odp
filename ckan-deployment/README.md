## Directory Structure
The ckan-deployment contains 
  - `ckan` directory that contains the `Dockerfile` and the setup files needed for building the CKAN image
  - `helm-templates` contains all the charts and templates that are needed for deployment
    - All the variables are set in `values.yaml.template` while the secrets are kept in the secret repository  

## CI/CD Pipeline

The CI/CD pipeline deploys this  has two jobs that are defined in [main.yml](.github/workflows/main.yml)

- **Build and Scan Image with Integration Tests**
  - This job builds the CKAN image
  - Pushes the image to ECR
  - Set up Docker containers to perform integration and unit tests in a disposable environemnt using the CKANimage that is built earlier 
  - Perform Integration tests
    - Installs cypress dependencies
    - Runs a script to add an API Token for the CKAN user running in the container for integration tests that require authorization
  - Performs unit test
    - Uses minio for s3filestore unit testing
    - Runs the tests
  - Runs container vulnerability scanner based on trivy
- **Deploy To AWS**
  - Once the Build and Scan Image with Integration Tests job passes, the deployment process is initiated
  - We log into AWS and ECR using OIDC roles and configure kubeconfig.
  - Then, we deploy using Helm upgrade, which uses the `values.yaml` generated from `values.yaml.develop.template` after substituting the variable values.
