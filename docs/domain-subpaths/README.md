# Domain Subpaths

**Note**: _Implementing this for local development, within the GitHub actions pipeline, and for deployments requires a few different approaches._

In all of the cases below, you _must_ update any CKAN backend URLs to match the new domain/path (this will be covered in each section).

## Local Development

For local development, the following changes are needed (the current dev setup in wri-odp is already setup for this—I’m documenting it here for future reference):

- Add `RUN ckan config-tool ${CKAN_INI} "ckan.root_path = /private-admin/{{LANG}}"` near the end of `ckan-backend-dev/ckan/Dockerfile.dev`
- In `ckan-backend-dev/ckan/setup/start_ckan_development.sh.override`, on the last line, add `---prefix /private-admin` to the `ckan` command (this is what starts the dev version of CKAN, which provides auto-reloading of CKAN when extension code is changed, etc.): `ckan -c $CKAN_INI run -H 0.0.0.0 --prefix /private-admin`
- Add an NGINX container to ckan-backend-dev/docker-compose.dev.yml:
  ```yaml
  nginx:
    image: nginx:latest
    container_name: nginx-redirect
    ports:
      - "3001:3001"
    volumes:
      - ./ckan/setup/nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - ckan-dev
    restart: unless-stopped
    extra_hosts:
      - "host.docker.internal:host-gateway"
  ```
- Create ckan-backend-dev/ckan/setup/nginx.conf with the following:
  ```nginx
  server {
      listen 3001;

      location /private-admin/ {
          proxy_pass http://ckan-dev:5000/private-admin/;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  
      location / {
          proxy_pass http://host.docker.internal:3000/;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  ```
- Add `ckan.root_path` variable in `ckan-backend-dev/Dockerfile.dev` (near the end of the Dockerfile):
  ```Dockerfile
  RUN ckan config-tool ${CKAN_INI} "ckan.plugins = ${CKAN__PLUGINS}"
  RUN ckan config-tool ${CKAN_INI} "ckan.auth.create_user_via_web = false"
  RUN ckan config-tool ${CKAN_INI} "ckan.root_path = /private-admin/{{LANG}}" <--- this line
  ```
- After starting CKAN and the frontend, you can access the portals through the same local path using nginx at `http://localhost:3001` and `http://localhost:3001/private-admin`

### Environment Variables

- In `wri-odp/ckan-backend-dev/.env`:
  ```env
  CKAN_SITE_URL=http://ckan-dev:5000
  CKAN_URL=http://ckan-dev:5000/private-admin
  NEXT_PUBLIC_CKAN_URL=http://ckan-dev:5000/private-admin
  ```
- In `ckan-backend-dev/.env.frontend.example`:
  ```env
  NEXT_PUBLIC_CKAN_URL=http://ckan-dev:5000/private-admin
  CKAN_SITE_URL=http://ckan-dev:5000/private-admin
  ```

## GitHub Actions

When the pipeline is running in GitHub Actions, a different method is used to setup the new subpath.

- In deployment/ckan/setup/start_ckan.sh.override, add the following after where UWSGI_OPTS is defined:
  ```bash
  ... the rest of the script ...

  UWSGI_OPTS="--socket /tmp/uwsgi.sock \
              --wsgi-file /srv/app/wsgi.py \
              --module wsgi:application \
              --uid 92 --gid 92 \
              --http 0.0.0.0:5000 \
              --master --enable-threads \
              --lazy-apps \
              -p 6 -L -b 32768 --vacuum \
              --harakiri $UWSGI_HARAKIRI"

  # Add the following:
  if [ "$GITHUB_ACTIONS" = "true" ]; then
    UWSGI_OPTS="$UWSGI_OPTS --single-interpreter --manage-script-name --mount /private-admin=/srv/app/wsgi.py"
  fi

  export SCRIPT_NAME="/private-admin"

  ... the rest of the script ...
  ```
- Add `GITHUB_ACTIONS=true` to `environment` and update the health check URL in the `ckan-dev` service in `ckan-backend-dev/docker-compose.test.yml`:
  ```yaml
  version: "3"

  volumes:
    ckan_storage:
    pg_data:
    solr_data:
    minio_data:

  services:

    ckan-dev:
      container_name: ${CKAN_CONTAINER_NAME}
      image: ${CKAN_IMAGE}
      environment:
        - GITHUB_ACTIONS=true <--- here
      ... other options ...
      healthcheck:
        test: ["CMD", "wget", "-qO", "/dev/null", "http://ckan-dev:5000/private-admin/en"] <--- and here

  ... other services ...
  ```
- Update the CKAN URLs in the frontend service in `ckan-backend-dev/docker-compose.test.yml`:
  ```yaml
  ... other services ...

    frontend:
      container_name: wri-frontend
      build:
        context: ../deployment/frontend/
        args:
          - NEXT_PUBLIC_CKAN_URL=http://ckan-dev:5000/private-admin/en <--- here
          - NEXT_PUBLIC_NEXTAUTH_URL=http://localhost:3000
          - NEXT_PUBLIC_GTM_ID=AAAAAAAAA
          - NEXT_PUBLIC_DISABLE_HOTJAR=disabled
          - NEXT_PUBLIC_HOTJAR_ID=AAAAAAAAA
          - NEXT_PUBLIC_GFW_API_KEY="1111"
          - OSANO_URL="YOUR_OSANO_URL/osano.js"
          - NEXT_PUBLIC_DEPLOYMENT_TYPE="dev"
      environment:
        - NEXTAUTH_SECRET=secret
        - NEXTAUTH_URL=http://localhost:3000
        - CKAN_URL=http://ckan-dev:5000/private-admin/en <--- and here
      ... other options ...

  ... other services ...
  ```
- Add `ckan.root_path` variable in `ckan-backend-dev/Dockerfile.dev` (near the end of the Dockerfile):
  ```Dockerfile
  RUN ckan config-tool ${CKAN_INI} "ckan.plugins = ${CKAN__PLUGINS}"
  RUN ckan config-tool ${CKAN_INI} "ckan.auth.create_user_via_web = false"
  RUN ckan config-tool ${CKAN_INI} "ckan.root_path = /private-admin/{{LANG}}" <--- this line
  ```

After this, the tests should pass in the pipeline again.

### Environment Variables

- In `wri-odp/ckan-backend-dev/.env`:
  ```env
  CKAN_SITE_URL=http://ckan-dev:5000
  CKAN_URL=http://ckan-dev:5000/private-admin/en
  NEXT_PUBLIC_CKAN_URL=http://ckan-dev:5000/private-admin/en
  ```
- In `ckan-backend-dev/.env.frontend.example`:
  ```env
  NEXT_PUBLIC_CKAN_URL=http://ckan-dev:5000/private-admin/en
  CKAN_SITE_URL=http://ckan-dev:5000/private-admin/en
  ```

_Note_: `/en` is appended to the URLs here because CKAN expects a language code in the URL path in some cases. This can be an issue when the pipeline is running, so it’s best to add it to the URLs here to avoid any issues.

## Deployments

Handling the subpath on the deployments is done with Helm YAML config files for NGINX. This requires one for the CKAN UI and one for the API. In all cases in the following, `staging` can be replaced with `prod` or `dev` for a given environment (including `staging` in the file names):

- In `deployment/helm-templates/templates/wri-staging-ingress-fe-internal-admin.yaml` (the most important part is under spec, specifically, path):
  ```yaml
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    annotations:
      cert-manager.io/cluster-issuer: cert-manager
      kubernetes.io/ingress.class: nginx
      meta.helm.sh/release-name: dx-helm-wri-staging-release
      meta.helm.sh/release-namespace: wri-odp-staging
      nginx.ingress.kubernetes.io/configuration-snippet: |
        more_set_headers "server: hide";
        more_set_headers "X-Content-Type-Options: nosniff";
        more_set_headers "X-Xss-Protection: 1";
        more_set_headers "Referrer-Policy: origin";
        more_set_headers "Expect-CT: max-age=86400, enforce, report-uri='[reportURL]'";
        more_set_headers "X-Permitted-Cross-Domain-Policies: none";
      nginx.ingress.kubernetes.io/limit-connections: "50"
      nginx.ingress.kubernetes.io/limit-rps: "50"
      nginx.ingress.kubernetes.io/proxy-body-size: 1000M
      nginx.ingress.kubernetes.io/proxy-connect-timeout: "60"
      nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
      nginx.ingress.kubernetes.io/rewrite-target: /$1
      nginx.ingress.kubernetes.io/use-regex: "true"
    labels:
      app.kubernetes.io/managed-by: Helm
    name: wri-staging-ingress-fe-internal-admin
    namespace: wri-odp-staging
  spec:
    rules:
    - host: wri.staging.frontend.datopian.com
      http:
        paths:
        - backend:
            service:
              name: wri-staging-ckan-svc
              port:
                number: 80
          path: /private-admin/(.*)
          pathType: ImplementationSpecific
        - backend:
            service:
              name: wri-staging-ckan-svc
              port:
                number: 80
          path: /private-admin
          pathType: ImplementationSpecific
    tls:
    - hosts:
      - wri.staging.frontend.datopian.com
      secretName: wri.staging.frontend.datopian.com
  ```
- In `deployment/helm-templates/templates/wri-staging-ingress-fe-internal-api.yaml` (same as the previous file, the most important part is under spec, specifically, path):
  ```yaml
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    annotations:
      cert-manager.io/cluster-issuer: cert-manager
      kubernetes.io/ingress.class: nginx
      meta.helm.sh/release-name: dx-helm-wri-staging-release
      meta.helm.sh/release-namespace: wri-odp-staging
      nginx.ingress.kubernetes.io/configuration-snippet: |
        more_set_headers "server: hide";
        more_set_headers "X-Content-Type-Options: nosniff";
        more_set_headers "X-Xss-Protection: 1";
        more_set_headers "Referrer-Policy: origin";
        more_set_headers "Expect-CT: max-age=86400, enforce, report-uri='[reportURL]'";
        more_set_headers "X-Permitted-Cross-Domain-Policies: none";
      nginx.ingress.kubernetes.io/limit-connections: "50"
      nginx.ingress.kubernetes.io/limit-rps: "50"
      nginx.ingress.kubernetes.io/proxy-body-size: 1000M
      nginx.ingress.kubernetes.io/proxy-connect-timeout: "60"
      nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
      nginx.ingress.kubernetes.io/rewrite-target: /api/action/$1
      nginx.ingress.kubernetes.io/use-regex: "true"
    labels:
      app.kubernetes.io/managed-by: Helm
    name: wri-staging-ingress-fe-internal-api
    namespace: wri-odp-staging
  spec:
    rules:
    - host: wri.staging.frontend.datopian.com
      http:
        paths:
        - backend:
            service:
              name: wri-staging-ckan-svc
              port:
                number: 80
          path: /api/action/(.*)
          pathType: ImplementationSpecific
    tls:
    - hosts:
      - wri.staging.frontend.datopian.com
      secretName: wri.staging.frontend.datopian.com
  ```

### Environment Variables

For deployments, environment variables are handled differently. You must update them in the [wri-odp-secrets repo](https://github.com/wri/wri-odp-secrets?tab=readme-ov-file#wri-odp-secrets) (see the documentation for more details on applying changes). For example, to set the `CKAN_URL` and `NEXT_PUBLIC_CKAN_URL` to `https://wri.staging.frontend.datopian.com` (the frontend uses these variables for API calls, so we don’t need the `/private-admin`, as `/api` is appended to the base domain by the code), you would follow the documentation steps to encode the URL string using base64 and put the encoded string in the respective variables in `wri-odp-secrets/k8s-secrets/staging/wri-staging-frontend-envvars.yaml`:
```yaml
apiVersion: v1
data:
  ... other secrets ...
  CKAN_URL: <YOUR_ENCODED_SECRET>
  NEXT_PUBLIC_CKAN_URL: <YOUR_ENCODED_SECRET>
  ... other secrets ...
kind: Secret
metadata:
  annotations:
    meta.helm.sh/release-name: dx-helm-wri-staging-release
    meta.helm.sh/release-namespace: wri-odp-staging
  labels:
    app.kubernetes.io/managed-by: Helm
  name: wri-staging-frontend-envvars
  namespace: wri-odp-staging
type: Opaque
```