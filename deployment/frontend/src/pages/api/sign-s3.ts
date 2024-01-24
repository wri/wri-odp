//write a next.js api route that returns hello world
// in typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '@/env.mjs'
import s3 from '@/server/s3'
import { v4 as uuidv4 } from 'uuid'
import { slugify } from '@/utils/slugify'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
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
    const _filename = filename.split('.')[0]
    const key = slugify(`${_filename}-${uuidv4()}`)
    const signedUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
            Bucket: env.S3_BUCKET_NAME,
            Key: filePath
                ? `${_filePath}/${key}.${extension}`
                : `resources/${fileHash}/${key}.${extension}`,
            ContentType: contentType as string,
            ACL: 'public-read',
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
