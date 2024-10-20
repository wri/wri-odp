/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

import withBundleAnalyzer from '@next/bundle-analyzer'
import createMDX from '@next/mdx'

await import('./src/env.mjs')

const bundleAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
})

const withMDX = createMDX({
    // Add markdown plugins if needed
})

const cspHeader = `
    frame-ancestors '*';
`

/** @type {import("next").NextConfig} */
const config = {
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    reactStrictMode: true,
    output: 'standalone',

    /**
     * If you are using `appDir` then you must comment the below `i18n` config out.
     *
     * @see https://github.com/vercel/next.js/issues/41980
     */
    i18n: {
        locales: ['en'],
        defaultLocale: 'en',
    },
    images: {
        domains: [
            'wri-dev-ckan-svc',
            'wri.dev.ckan.datopian.com',
            'wri.staging.ckan.datopian.com',
            'wri.prod.ckan.datopian.com',
            'wri.dev.frontend.datopian.com',
            'wri.staging.frontend.datopian.com',
            'datasets.wri.org',
            'test-bucket-wri.s3.ap-northeast-1.amazonaws.com',
            'ckan-dev',
            'ckan',
            'gravatar.com',
            's3.amazonaws.com',
        ],
    },
    pageExtensions: ['tsx', 'mdx', 'ts', 'md'],
}

export default bundleAnalyzer(withMDX(config))
