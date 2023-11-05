import { env } from "@/env.mjs";
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: env.S3_BUCKET_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_KEY_ID,
  },
});

export default s3; 
