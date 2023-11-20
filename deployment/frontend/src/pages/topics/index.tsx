import Search from '@/components/Search'
import Header from '@/components/_shared/Header'
import Highlights from '@/components/Highlights'
import Recent from '@/components/Recent'
import Footer from '@/components/_shared/Footer'
import TopicsSearchResults from '@/components/topics/TopicsSearchResults'
import TopicsSearch from '@/components/topics/TopicsSearch'
import { NextSeo } from 'next-seo'

export default function TopicsPage() {
    return (
        <>
            <NextSeo title="Topics" />
            <Header />
            <TopicsSearch />
            <TopicsSearchResults />
            <Footer
                links={{
                    primary: { title: 'Advanced Search', href: '#' },
                    secondary: { title: 'Explore Teams', href: '#' },
                }}
            />
        </>
    )
}
