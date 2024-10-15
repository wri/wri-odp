console.log('[*] SITE_URL', process.env.NEXT_PUBLIC_NEXTAUTH_URL)

module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_NEXTAUTH_URL,
    generateRobotsTxt: true,
    exclude: ['/server-sitemap.xml', '/dashboard/*', '/dashboard'],
    robotsTxtOptions: {
        additionalSitemaps: [
            `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/server-sitemap.xml`,
        ],
        policies:
            process.env.NEXT_PUBLIC_DEPLOYMENT_TYPE === 'production'
                ? [
                      {
                          userAgent: '*',
                          disallow: ['/dashboard/*'],
                      },
                      {
                          userAgent: '*',
                          allow: '/',
                      },
                  ]
                : [
                      {
                          userAgent: '*',
                          disallow: ['/*'],
                      },
                  ],
    },
}
