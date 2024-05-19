def create_dataset_rw(dataset):
    rw_dataset = {
        'name': dataset.get('title', ''),
        'connectorType': dataset['connectorType'],
        'provider': dataset['provider'],
        'published': False,
        'env': 'staging',
        'application': ['data-explorer'],
        'connectorUrl': dataset.get('connectorUrl', ''),
        'tableName': dataset.get('tableName', ''),
    }
    body = json.dumps({'dataset': rw_dataset})
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {os.getenv('RW_API_KEY')}",
    }
    
    response = requests.post(
        'https://api.resourcewatch.org/v1/dataset',
        headers=headers,
        data=body
    )
    
    dataset_rw = response.json()
    if 'errors' in dataset_rw:
        raise Exception(json.dumps(dataset_rw['errors']))
    
    return dataset_rw
