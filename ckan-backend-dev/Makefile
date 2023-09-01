.PHONY:

CKAN_HOME := /srv/app
DOCKER_COMPOSE_YML := docker-compose.dev.yml
CKAN_CONTAINER := ckan-dev
CKAN_DB_CONTAINER := db
CKAN_DB_USER := ckandbuser
CKAN_DB_NAME := ckandb

build:
	docker compose -f $(DOCKER_COMPOSE_YML) build

clean:
	docker compose -f $(DOCKER_COMPOSE_YML) down -v --remove-orphans

up:
	docker compose -f $(DOCKER_COMPOSE_YML) up

down:
	docker compose -f $(DOCKER_COMPOSE_YML) down

restart:
	docker compose -f $(DOCKER_COMPOSE_YML) restart

search-index-rebuild:
	docker compose -f $(DOCKER_COMPOSE_YML) exec $(CKAN_CONTAINER) ckan -c ckan.ini search-index rebuild

access-db:
	docker compose -f $(DOCKER_COMPOSE_YML) exec $(CKAN_DB_CONTAINER) /bin/bash -c "psql -U $(CKAN_DB_USER) $(CKAN_DB_NAME)"

shell:
	docker compose -f $(DOCKER_COMPOSE_YML) exec $(CKAN_CONTAINER) /bin/bash

integration-tests:
	cd wri-integration-tests && node test.js
