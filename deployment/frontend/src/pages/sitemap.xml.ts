import { generateDatasetSiteMap } from '@/utils/apiUtils'
import type { GetServerSideProps } from 'next'
function generateSiteMap(posts: Array<{ link: string; date?: string }>) {
    return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">  
     ${posts
         .map((post) => {
             return `
       <url>
           <loc>${post.link}</loc>
           ${post.date ? `<lastmod>${post.date}</lastmod>` : ''}
       </url>
     `
         })
         .join('')}
   </urlset>
 `
}

function SiteMap() {
    // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    const datasetSitemap = await generateDatasetSiteMap()
    const sitemap = generateSiteMap(datasetSitemap)

    res.setHeader('Content-Type', 'text/xml')
    // we send the XML to the browser
    res.write(sitemap)
    res.end()

    return {
        props: {},
    }
}

export default SiteMap
