import type { AwsS3UploadParameters } from "@uppy/aws-s3";
import type { UppyFile } from "@uppy/core";
import { sha256 } from "crypto-hash";

export async function getUploadParameters(file: UppyFile, filePath?: string) {
  const arrayBuffer = await new Response(file.data).arrayBuffer();
  const response = await fetch("/api/sign-s3", {
    method: "POST",
    headers: {
      accept: "application/json",
    },
    body: JSON.stringify({
      filename: file.name,
      filePath: filePath ?? null,
      fileHash: await sha256(arrayBuffer),
      contentType: file.type,
    }),
  });
  if (!response.ok)
    throw new Error("Unsuccessful request", { cause: response });

  // Parse the JSON response.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data: { url: string; method: "PUT" } = await response.json();

  // Return an object in the correct shape.
  const object: AwsS3UploadParameters = {
    method: data.method,
    url: data.url,
    fields: {}, // For presigned PUT uploads, this should be left empty.
    // Provide content type header required by S3
    headers: {
      "Content-Type": file.type ? file.type : "application/octet-stream",
    },
  };
  return object;
}
