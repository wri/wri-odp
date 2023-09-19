#!/bin/bash

# Initialize a file to collect test outputs
echo "CKAN and Extension Test Results" > test_results.txt
echo "Test Summary" > test_summary.txt

# Run CKAN Core tests
# Replace the command below with the one you use for CKAN core tests
# pytest --ckan-ini=test-core.ini >> test_results.txt
# if [ $? -eq 0 ]; then
#     echo "CKAN Core: Passed" >> test_summary.txt
# else
#     echo "CKAN Core: Failed" >> test_summary.txt
# fi

# Loop through each extension directory to run tests

cd src

for dir in ckanext-*; do
  if [ -d "$dir" ]; then
    # Skip ckanext-envvars
    if [ "$dir" == "ckanext-envvars" ]; then
      continue
    fi

    cd $dir

    pytest --ckan-ini=test.ini ckanext/${dir#ckanext-}/tests 2>&1 | tee -a ../test_results.txt

    if [ $? -eq 0 ]; then
      echo "$dir: Passed" >> ../test_summary.txt
    else
      echo "$dir: Failed" >> ../test_summary.txt
    fi

    cd ..

  fi
done

# Display summary
cat test_summary.txt
