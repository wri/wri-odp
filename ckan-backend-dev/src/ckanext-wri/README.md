<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [ckanext-wri](#ckanext-wri)
  - [Development](#development)
  - [Testing](#testing)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# ckanext-wri

This is the WRI Open Data Portal extension for CKAN. It contains CKAN backend customizations for this project.

## Development

See the [CKAN Backend Development README](ckan-backend-dev/README.md) for instructions on how to set up a local Docker CKAN backend development environment.

This extension lives in `ckan-backend-dev/src/ckanext-wri`. It is symlinked to the root of this repo for convenience and visibility.

Because it's part of this unified repo, if you need to make changes, you can do so directly in the `ckanext-wri` directory. There's no external repo to clone or fork (like other CKAN extensions), so you can just create a new branch off of `dev`, make your changes, and submit a PR.

## Testing

The unit tests for this extension are run as part of the `make unit-tests` command in the `ckan-backend-dev` Docker development environment, but while developing, you can also run them alone. To do so, in another terminal window, go to `ckan-backend-dev` and run:

If the environment is not already running, start it:

    make up

Then enter the Docker shell:

    make shell

Once in the shell, navigate to the extension directory:

    cd src_extensions/ckanext-wri

Finally, run the tests:

    pytest --ckan-ini=test.ini ckanext/wri/tests
