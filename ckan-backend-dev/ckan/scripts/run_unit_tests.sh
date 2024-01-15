#!/bin/bash

ROOT_DIR=$(pwd)

echo "CKAN and Extension Test Results" > "$ROOT_DIR/test_results.txt"
echo "Test Summary" > "$ROOT_DIR/test_summary.txt"

# Run CKAN Core tests
# pytest --ckan-ini=test-core.ini >> test_results.txt
# if [ $? -eq 0 ]; then
#     echo "CKAN Core: Passed" >> test_summary.txt
# else
#     echo "CKAN Core: Failed" >> test_summary.txt
# fi

if [ -d "src_extensions/ckanext-wri" ]; then
  cd src_extensions/ckanext-wri

  pytest --ckan-ini=test.ini ckanext/wri/tests 2>&1 | tee -a "$ROOT_DIR/test_results.txt"
  PYTEST_EXIT_CODE=${PIPESTATUS[0]}

  if [ $PYTEST_EXIT_CODE -eq 0 ]; then
    echo "ckanext-wri: Passed" >> "$ROOT_DIR/test_summary.txt"
  else
    echo "ckanext-wri: Failed" >> "$ROOT_DIR/test_summary.txt"
  fi

fi

cd $ROOT_DIR/src

for dir in ckanext-*; do
  if [ -d "$dir" ]; then
    # Skip ckanext-envvars
    if [ "$dir" == "ckanext-envvars" ]; then
      continue
    fi

    cd $dir

    pytest --ckan-ini=test.ini ckanext/${dir#ckanext-}/tests 2>&1 | tee -a "$ROOT_DIR/test_results.txt"
    PYTEST_EXIT_CODE=${PIPESTATUS[0]}

    if [ $PYTEST_EXIT_CODE -eq 0 ]; then
      echo "$dir: Passed" >> "$ROOT_DIR/test_summary.txt"
    else
      echo "$dir: Failed" >> "$ROOT_DIR/test_summary.txt"
    fi

    cd ..

  fi
done

cat "$ROOT_DIR/test_summary.txt"

# GitHub Actions failure exit code
if grep -q "Failed" "$ROOT_DIR/test_summary.txt"; then
    exit 1
fi
