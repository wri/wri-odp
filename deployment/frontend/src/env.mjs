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
        AZURE_AD_TENANT_ID: z.string(),
        AZURE_AD_CLIENT_ID: z.string(),
        AZURE_AD_CLIENT_SECRET: z.string(),
        SMTP_SERVER: z.string(),
        SMTP_PORT: z.string(),
        SMTP_USER: z.string(),
        SMTP_PASSWORD: z.string(),
        SMTP_FROM: z.string(),
        PREFECT_INTERNAL_URL: z.string(),
    },

    /**
     * Specify your client-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars. To expose them to the client, prefix them with
     * `NEXT_PUBLIC_`.
     */
    client: {
        NEXT_PUBLIC_CKAN_URL: z.string(),
        NEXT_PUBLIC_NEXTAUTH_URL: z.string(),
        NEXT_PUBLIC_GTM_ID: z.string(),
        NEXT_PUBLIC_DISABLE_HOTJAR: z.string(),
        NEXT_PUBLIC_HOTJAR_ID: z.string(),
        NEXT_PUBLIC_GFW_API_KEY: z.string(),
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
        PREFECT_INTERNAL_URL: process.env.PREFECT_INTERNAL_URL,
        NEXT_PUBLIC_CKAN_URL: process.env.NEXT_PUBLIC_CKAN_URL,
        S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
        S3_SECRET_KEY_ID: process.env.S3_SECRET_KEY_ID,
        S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
        S3_BUCKET_REGION: process.env.S3_BUCKET_REGION,
        SYS_ADMIN_API_KEY: process.env.SYS_ADMIN_API_KEY,
        AZURE_AD_TENANT_ID: process.env.AZURE_AD_TENANT_ID,
        AZURE_AD_CLIENT_ID: process.env.AZURE_AD_CLIENT_ID,
        AZURE_AD_CLIENT_SECRET: process.env.AZURE_AD_CLIENT_SECRET,
        SMTP_SERVER: process.env.SMTP_SERVER,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASSWORD: process.env.SMTP_PASSWORD,
        SMTP_FROM: process.env.SMTP_FROM,
        NEXT_PUBLIC_NEXTAUTH_URL: process.env.NEXT_PUBLIC_NEXTAUTH_URL,
        NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID, 
        NEXT_PUBLIC_DISABLE_HOTJAR: process.env.NEXT_PUBLIC_DISABLE_HOTJAR || "enabled",
        NEXT_PUBLIC_HOTJAR_ID: process.env.NEXT_PUBLIC_HOTJAR_ID,
        NEXT_PUBLIC_GFW_API_KEY: process.env.NEXT_PUBLIC_GFW_API_KEY,
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
