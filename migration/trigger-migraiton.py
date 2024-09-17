import requests

# Define the URL of the CKAN instance and the API endpoint
ckan_url = "http://ckan-dev:5000"
api_endpoint = "/api/3/action/trigger_migration?file_name=gfw_datasets.csv"

# Define the headers for the API request
headers = {
    "Authorization": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI0SHA4SERqSE9iRTBDaTlNSGtRRTBYNkEzM1N4Y1dVOFhDOFFybXZGVkdnIiwiaWF0IjoxNzI1NjM5NDY2fQ.t-hvBpjl0TGwHIuZp3farIJ07xn9oAZD49UJMo4EWLLIOCxGlWmpjkspzCeOndDo8-YFGrSFBKtsU8gtE3ovuRDcBuCOCjF-htGEQ4Jj2RRNT2mmqrvNuMOyVOO4WwH-fvdmHq0xjIiK7lrYQRSxSsPHrvpvIELNdWzitXWP8wDmnlayH7AfyoKIFa-Vs9JxZqa6I2_C0mqFAuXs_e7KYc4w3S3j09H0hlBmgq9pdnMQLIV_vQA6hMQSZvonyMCEzIs5zHVqbdSzMG-xD97A9GTpYE_z0FrxoR3SluguFAS6mqUiKubpmv0gmeeTPfaIviq9Mt3URaV39IaSAKBxxg",
    "Content-Type": "application/json"
}

# Make the API request
response = requests.post(ckan_url + api_endpoint, headers=headers)

# Check the status of the request
if response.status_code == 200:
    print("Migration triggered successfully.")
else:
    print("Failed to trigger migration. Status code:", response.status_code)
