import qs from 'query-string'

export async function callOrttho(data: any) {
    const response = await fetch('https://ortto.wri.org/custom-forms/', {
        method: 'POST',
        body: qs.stringify(data),
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
    })
    const json = await response.text()
    return json
}
