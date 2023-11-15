import Search from '@/components/Search'
import Header from '@/components/_shared/Header'
import Highlights from '@/components/Highlights'
import Recent from '@/components/Recent'
import Footer from '@/components/_shared/Footer'
import { useState } from 'react'
import { Filter } from '@/interfaces/search.interface'

export default function test() {
    const [filters, setFilters] = useState<Filter[]>([])

    return (
        <>
            <Header />
            <Search filters={filters} setFilters={setFilters} />
            <Highlights />
            <Recent title="Recently added" />
            <Recent title="Recently updated" />
            <Footer />
        </>
    )
}
