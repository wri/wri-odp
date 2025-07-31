import { NextApiRequest, NextApiResponse } from 'next'
import qs from 'query-string'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const _body = JSON.parse(req.body)
    const body = {
        website: 'https://datasets.wri.org/',
        'form-name': 'Footer Sign-up Form',
        list: 'DATA - Data Explorer - NEWSL - LIST',
        email: _body.email,
    }
    const response = await fetch('https://ortto.wri.org/custom-forms/', {
        method: 'POST',
        body: qs.stringify(body),
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
    })
    const json = await response.text()
    return res.status(response.status).json(json)
}
