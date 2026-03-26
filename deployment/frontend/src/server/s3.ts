import { env } from '@/env.mjs';
import { S3Client } from '@aws-sdk/client-s3';

const isMinio = env.S3_ACCESS_KEY_ID === 'minioadmin';
const s3Endpoint: string | undefined =
    process.env.S3_ENDPOINT ??
    (isMinio ? 'http://minio:9000' : undefined);

const s3 = new S3Client({
    region: env.S3_BUCKET_REGION,
    credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_KEY_ID,
    },
    forcePathStyle: isMinio,
    endpoint: s3Endpoint,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
});

export default s3;
