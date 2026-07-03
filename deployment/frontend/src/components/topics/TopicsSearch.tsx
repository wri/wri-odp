import React from 'react';
import Spinner from '@/components/_shared/Spinner';

export default function TopicsSearch({
    setQuery,
    query,
    isLoading,
    groupType,
}: {
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    query: string;
    isLoading: boolean;
    groupType: string;
}) {
    return (
        <section
            id="search"
            className="group relative bg-cover bg-center bg-no-repeat w-full flex flex-col justify-center font-acumin h-[245px] "
            style={{
                backgroundImage:
                    groupType == 'Topics'
                        ? 'url(/images/banner-topics.png)'
                        : 'url(/images/banner-teams.png)',
            }}
        >
            <div className="pointer-events-none absolute bottom-2 left-6 z-10 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 xxl:left-20 2xl:left-20">
                Banner image by Chris Barbalis / Unsplash
            </div>
            <form
                onSubmit={(e) => console.log(e)}
                className="w-full px-8 xxl:px-0 max-w-8xl mx-auto -mt-[37px] "
            >
                <div className="w-full max-w-[819px] xxl:pl-8 2xl:px-0 ">
                    <h1 className="text-[40px]  leading-[48px] font-acumin font-semibold text-white mb-[25px]">
                        {groupType}
                    </h1>
                </div>
                <div className="relative flex w-full max-w-[819px] items-start justify-start gap-x-6 xxl:pl-8 2xl:px-0 h-[54.393px] ">
                    <input
                        onChange={(e) => setQuery(e.target.value)}
                        value={query}
                        name="search"
                        placeholder={`Search ${groupType === 'Teams' ? 'Teams' : 'Topics'}`}
                        aria-label="search"
                        className="h-full  block w-full border-0 px-5 py-2 text-[#000000] shadow-wri-small rounded-tr-[3px] rounded-br-[3px]  placeholder:text-gray-900 placeholder:text-base focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6 leading-[19.2px] rounded-tl-[3px] rounded-bl-[3px] border-r-0"
                    />
                    <div className="absolute flex h-[54.393px] px-8  right-0  leading-[29.25px] text-black bg-wri-gold rounded-tr-[3px] rounded-br-[3px]">
                        {isLoading ? (
                            <Spinner className="h-5 w-5 text-wri-black" />
                        ) : (
                            <button
                                type="submit"
                                aria-label="submit"
                                className="text-[21px] font-semibold  font-acumin "
                            >
                                Search
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </section>
    );
}
