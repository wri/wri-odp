#!/bin/bash

echo "Initializing custom tables..."

ckan -c production.ini notificationdb

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo "Failed to initialize the notification table"
fi

ckan -c production.ini pendingdatasetsdb

if [ $EXIT_CODE -ne 0 ]; then
    echo "Failed to initialize the pending datasets table"
    exit $EXIT_CODE
fi

ckan -c production.ini resourcelocationdb

if [ $EXIT_CODE -ne 0 ]; then
    echo "Failed to initialize the data file location table"
    exit $EXIT_CODE
fi

echo "Custom tables initialized successfully"
