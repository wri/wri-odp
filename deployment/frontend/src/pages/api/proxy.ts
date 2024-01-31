import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const body = JSON.parse(req.body)

    const { url, headers } = body

    const response = await fetch(url, { headers })

    return res.json(await response.json())
}
