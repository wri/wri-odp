import { env } from "@/env.mjs";
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: env.S3_BUCKET_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_KEY_ID,
  },
  forcePathStyle: env.S3_ACCESS_KEY_ID === "minioadmin" ? true : false,
  endpoint: env.S3_ACCESS_KEY_ID === "minioadmin" ? "http://localhost:9000/" : undefined
});

export default s3; 
