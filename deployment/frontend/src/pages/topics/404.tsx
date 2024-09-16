import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
import Header from '@/components/_shared/Header'
import { NextSeo } from 'next-seo'

export default function DatasetNotFound() {
    const links = [{ label: 'Topics', url: '/topics', current: false }]
    return (
        <>
            <NextSeo title={`Not Found - Topics`} />
            <Header />
            <Breadcrumbs links={links} />
            <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
                <div className="text-center">
                    <p className="text-base font-semibold text-wri-green">
                        404
                    </p>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        Topic not found
                    </h1>
                    <p className="mt-6 text-base leading-7 text-gray-600">
                        Sorry, we couldn’t find the page you’re looking for.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <a
                            href="/"
                            className="rounded-md bg-wri-green px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-wri-dark-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wri-green"
                        >
                            Go back home
                        </a>
                        <a
                            href="/topics"
                            className="text-sm font-semibold text-gray-900"
                        >
                            Go back to the topic search page
                        </a>
                    </div>
                </div>
            </main>
        </>
    )
}
