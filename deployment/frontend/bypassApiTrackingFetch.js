const originalFetch = global.fetch

/**
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<Response>}
 */
function bypassApiTrackingFetch(url = '', options = {}) {
    options.headers = options.headers || {}
    console.log(`Using bypassApiTrackingFetch: ${url}`)

    if (
        typeof url === 'string' &&
        (url.includes('/api/action/') ||
            url.includes('/api/2/action/') ||
            url.includes('/api/3/action/'))
    ) {
        console.log('Adding tracking headers to CKAN request')
        options.headers = {
            ...options.headers,
            'X-From-Frontend-Portal': 'true',
        }
        console.log(
            `Header added successfully to CKAN request: ${
                options.headers['X-From-Frontend-Portal'] === 'true'
            }`
        )
    } else {
        console.log('URL is not a CKAN API endpoint: skipping...')
    }

    return originalFetch(url, options).catch((error) => {
        console.error('Error occurred during fetch:', error)
        throw error
    })
}

global.fetch = bypassApiTrackingFetch
