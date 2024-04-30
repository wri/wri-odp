import { Hero } from '../home/Hero'
import { HomeFooter } from '../home/HomeFooter'
import Header from './Header'
export default function MdxLayout({ children }: { children: React.ReactNode }) {
    // Create any shared layout or styles here
    return (
        <>
            <Header />
            <main className="px-8 mb-20 xxl:px-0  max-w-4xl mx-auto flex flex-col font-acumin mt-16 prose sm:prose-sm md:prose-base prose-headings:mt-8 prose-headings:font-semibold prose-headings:text-black prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-h5:text-md prose-h6:text-lg prose-p:mb-1 dark:prose-headings:text-white">
                {children}
            </main>

            <HomeFooter />
        </>
    )
}
