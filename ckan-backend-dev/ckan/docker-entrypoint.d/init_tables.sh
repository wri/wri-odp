#!/bin/bash

echo "Initializing custom tables..."

ckan -c production.ini notificationdb

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo "Failed to initialize custom tables"
    exit $EXIT_CODE
fi

echo "Custom tables initialized successfully"