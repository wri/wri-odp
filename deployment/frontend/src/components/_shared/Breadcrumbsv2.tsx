import NextLink from 'next/link';

interface Link {
    label: string;
    url: string;
    current: boolean;
}
export function Breadcrumbs({ links }: { links: Link[] }) {
    return (
        <nav className="flex bg-wri-green sm:h-16" aria-label="Breadcrumb">
            <ol
                role="list"
                className="flex-wrap max-w-8xl mx-auto flex w-full space-x-4 px-8 2xl:px-0 font-acumin leading-[1.25rem]"
            >
                <li className="flex">
                    <div className="flex items-center">
                        <NextLink
                            href="/"
                            className="text-white text-[17px] font-semibold hover:text-gray-100 transition"
                        >
                            Home
                        </NextLink>
                    </div>
                </li>
                {links.map((page) => (
                    <li key={page.label} className="flex">
                        <div className="flex items-center">
                            <svg
                                className="h-5 w-5 flex-shrink-0 text-gray-300"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                            </svg>
                            <a
                                href={page.url}
                                className="ml-4 text-white text-[17px] font-semibold hover:text-gray-100 transition"
                                aria-current={page.current ? 'page' : undefined}
                            >
                                {page.label}
                            </a>
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
