<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [WRI ODP](#wri-odp)
  - [CKAN Backend Development](#ckan-backend-development)
  - [CKAN Deployment](#ckan-deployment)
  - [Updating READMEs](#updating-readmes)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# WRI ODP

The WRI Open Data Portal monorepo

## CKAN Backend Development

See the [CKAN Backend Development README](ckan-backend-dev/README.md) for instructions on how to set up a local Docker CKAN backend development environment. Note: the `ckanext-wri` extension in the root of this repo is a symlink to `ckanext-wri` in `ckan-backend-dev/src`. See the README above and the [WRI Extension README](ckan-backend-dev/src/ckanext-wri/README.md) for more information.

## CKAN Deployment

See the [CKAN Deployment README](ckan-deployment/README.md) for instructions on how to deploy CKAN to EKS.

## Updating READMEs

The table of contents in the READMEs are generated using generated using [DocToc](https://github.com/thlorenz/doctoc). You can install it globally by running:

    npm install -g doctoc

Then, to update the table of contents in a markdown file, for example, `README.md`, run:

    doctoc README.md



