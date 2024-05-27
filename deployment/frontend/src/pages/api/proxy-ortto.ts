import { NextApiRequest, NextApiResponse } from 'next'
import qs from 'query-string'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const body = JSON.parse(req.body)
    const response = await fetch('https://ortto.wri.org/custom-forms/gfw/', {
        method: 'POST',
        body: qs.stringify(body),
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
    })
    const json = await response.text()
    return res.status(response.status).json(json)
}
