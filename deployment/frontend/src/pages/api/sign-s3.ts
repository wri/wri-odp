//write a next.js api route that returns hello world
// in typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '@/env.mjs'
import s3 from '@/server/s3'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const fileId = uuidv4()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { filePath, filename, fileHash, contentType } = JSON.parse(
        req.body as string
    )
    let _filePath = filePath
    //done just for local development
    if (env.S3_ACCESS_KEY_ID === 'minioadmin') {
        _filePath = _filePath.replace('ckan/', '')
    }
    const extension = filename.split('.').pop()
    const signedUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: filePath
                ? `${_filePath}/${fileId}.${extension}`
                : `resources/${fileHash}/${fileId}.${extension}`,
            ContentType: contentType as string,
        }),
        { expiresIn: 3600 }
    )
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.json({
        url: signedUrl,
        method: 'PUT',
    })
    res.end()
}
