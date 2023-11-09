import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { env } from '@/env.mjs'
import { z } from 'zod'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import s3 from '@/server/s3'

export const uploadsRouter = createTRPCRouter({
    getPresignedUrl: protectedProcedure
        .input(z.object({ key: z.string() }))
        .query(async ({ input }) => {
            let s3keyPaths = input.key.split('/')
            const s3key =
                env.S3_ACCESS_KEY_ID === 'minioadmin'
                    ? s3keyPaths.slice(1, s3keyPaths.length).join('/')
                    : s3keyPaths.join('/')
            const signedUrl = await getSignedUrl(
                s3,
                new GetObjectCommand({
                    Bucket: env.S3_BUCKET_NAME,
                    Key: s3key,
                }),
                { expiresIn: 3600 }
            )
            return signedUrl
        }),
})
