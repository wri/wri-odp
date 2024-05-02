import { Hero } from '../home/Hero'
import { HomeFooter } from '../home/HomeFooter'
import Header from './Header'
import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
export default function MdxLayout({
    children,
    label,
    url,
    title,
}: {
    children: React.ReactNode
    label: string
    url: string
    title: string
}) {
    let links = [
        {
            label: label,
            url: url,
            current: true,
        },
    ]

    if (label !== 'User Guide') {
        links = [
            {
                label: 'User Guide',
                url: '/user-guide',
                current: false,
            },
            {
                label: label,
                url: url,
                current: true,
            },
        ]
    }

    return (
        <>
            <Header />
            <Breadcrumbs links={links} />
            <section
                id="search"
                className="flex h-[200px] w-full flex-col bg-cover bg-center bg-no-repeat font-acumin"
                style={{
                    backgroundImage: 'url(/images/bg.png)',
                }}
            >
                <div className="mx-auto my-auto flex w-full max-w-4xl space-x-4 px-4 font-acumin sm:px-6 xxl:px-0">
                    <h1 className=" text-4xl text-white font-extrabold ">
                        {title}
                    </h1>
                </div>
            </section>
            <main className="px-8 mb-20 xxl:px-0  max-w-4xl mx-auto flex flex-col font-acumin mt-16 prose sm:prose-sm md:prose-base prose-headings:mt-8 prose-headings:font-semibold prose-headings:text-black prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-h5:text-md prose-h6:text-lg prose-p:my-1 prose-li:my-1 dark:prose-headings:text-white">
                {children}
            </main>

            <HomeFooter />
        </>
    )
}
