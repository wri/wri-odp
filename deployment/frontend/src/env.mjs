import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
    /**
     * Specify your server-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars.
     */
    server: {
        NODE_ENV: z
            .enum(['development', 'test', 'production'])
            .default('development'),
        NEXTAUTH_SECRET:
            process.env.NODE_ENV === 'production'
                ? z.string()
                : z.string().optional(),
        NEXTAUTH_URL: z.preprocess(
            // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
            // Since NextAuth.js automatically uses the VERCEL_URL if present.
            (str) => process.env.VERCEL_URL ?? str,
            // VERCEL_URL doesn't include `https` so it cant be validated as a URL
            process.env.VERCEL ? z.string() : z.string().url()
        ),
        CKAN_URL: z.string(),
        RW_API_KEY: z.string(),
        S3_BUCKET_NAME: z.string(),
        S3_BUCKET_REGION: z.string(),
        S3_ACCESS_KEY_ID: z.string(),
        S3_SECRET_KEY_ID: z.string(),
        SYS_ADMIN_API_KEY: z.preprocess(
            (str) => process.env.SYS_ADMIN_API_KEY ?? str,
            z.string()
        ),
    },

    /**
     * Specify your client-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars. To expose them to the client, prefix them with
     * `NEXT_PUBLIC_`.
     */
    client: {
    },

    /**
     * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
     * middlewares) or client-side so we need to destruct manually.
     */
    runtimeEnv: {
        RW_API_KEY: process.env.RW_API_KEY,
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        CKAN_URL: process.env.CKAN_URL,
        S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
        S3_SECRET_KEY_ID: process.env.S3_SECRET_KEY_ID,
        S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
        S3_BUCKET_REGION: process.env.S3_BUCKET_REGION,
        SYS_ADMIN_API_KEY: process.env.SYS_ADMIN_API_KEY,
    },
    /**
     * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
     * This is especially useful for Docker builds.
     */
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    /**
     * Makes it so that empty strings are treated as undefined.
     * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
     */
    emptyStringAsUndefined: true,
})
