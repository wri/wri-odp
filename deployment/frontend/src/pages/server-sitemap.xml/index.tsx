import { generateDataSiteMap } from '@/utils/apiUtils'
import type { GetServerSideProps } from 'next'
import { getServerSideSitemapLegacy } from 'next-sitemap'

function SiteMap() {
    // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const fields = await generateDataSiteMap()

    return getServerSideSitemapLegacy(ctx, fields)
}

export default SiteMap
