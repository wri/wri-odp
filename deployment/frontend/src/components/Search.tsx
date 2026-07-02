import React, {
    type Dispatch,
    type SetStateAction,
    useEffect,
    useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Filter } from '@/interfaces/search.interface';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Search({
    setFilters,
    filters,
}: {
    setFilters: Dispatch<SetStateAction<Filter[]>>;
    filters: Filter[];
}) {
    const getIsSearching = () => {
        const filter = filters?.find((f) => f.key == 'search');

        return !!filter;
    };

    const [isSearch, setIsSearch] = useState(getIsSearching());

    const searchSchema = z.object({ search: z.string() });
    type searchFormType = z.infer<typeof searchSchema>;

    const { handleSubmit, register, reset, watch } = useForm<searchFormType>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            search: filters?.find((f) => f.key == 'search')?.value ?? '',
        },
    });

    useEffect(() => {
        const searchFilter = filters?.find((f) => f.key == 'search');
        setIsSearch(!!searchFilter);

        if (watch('search') != searchFilter?.value) {
            reset({ search: '' });
        }
    }, [filters, reset, watch]);

    return (
        <section
            id="search"
            className="flex h-[245px] w-full flex-col bg-cover bg-center justify-center  bg-no-repeat font-acumin"
            style={{
                backgroundImage: 'url(/images/banner-search.png)',
            }}
        >
            <form
                onSubmit={handleSubmit((data) => {
                    if (
                        watch('search') !=
                        filters.find((f) => f.key == 'search')?.value
                    ) {
                        setFilters((prev) => {
                            const newFilters = [...prev];
                            const searchFilter = newFilters.find(
                                (filter) => filter.key == 'search'
                            );

                            if (searchFilter) {
                                if (data.search) {
                                    searchFilter.value = data.search;
                                    searchFilter.label = data.search;
                                    setIsSearch(true);
                                } else {
                                    newFilters.splice(
                                        newFilters.findIndex(
                                            (filter) => filter.key == 'search'
                                        ),
                                        1
                                    );
                                    setIsSearch(false);
                                }
                            } else if (data.search) {
                                newFilters.push({
                                    title: 'Search',
                                    key: 'search',
                                    label: data.search,
                                    value: data.search,
                                });
                                setIsSearch(true);
                            }

                            return newFilters;
                        });
                    }
                })}
                className="w-full px-8 xxl:px-0 max-w-8xl mx-auto -mt-[37px] "
            >
                <div className="w-full max-w-[819px] xxl:pl-8 2xl:px-0 ">
                    <h1 className="text-[40px]  leading-[48px] font-['Acumin Pro SemiCondensed'] font-semibold text-white mb-[25px]">
                        Search Datasets
                    </h1>
                </div>
                <div className="relative flex w-full max-w-[819px] items-start justify-start gap-x-6 xxl:pl-8 2xl:px-0 h-[54.393px] ">
                    <input
                        placeholder="Search data"
                        aria-label="search"
                        className="h-full placeholder:font-acumin block w-full border-0 px-5 py-2 text-[#4f4e4e]  shadow-wri-small rounded-tr-[3px] rounded-br-[3px] placeholder:text-gray-900 placeholder:text-base  focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6 leading-[19.2px] rounded-tl-[3px] rounded-bl-[3px] border-r-0"
                        {...register('search')}
                    />
                    <div className="absolute flex h-[54.392px] px-8  right-0  leading-[29.25px] text-black bg-wri-gold rounded-tr-[3px] rounded-br-[3px] border-l-0 ">
                        {!isSearch ||
                        watch('search') !=
                            filters?.find((f) => f.key == 'search')?.value ? (
                            <button
                                type="submit"
                                aria-label="submit query"
                                className="text-[21px] font-semibold  font-acumin "
                            >
                                Search
                            </button>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setFilters((prev) => {
                                        const newFilters = [...prev];
                                        newFilters.splice(
                                            newFilters.findIndex(
                                                (filter) =>
                                                    filter.key == 'search'
                                            ),
                                            1
                                        );
                                        return newFilters;
                                    });
                                    setIsSearch(false);

                                    reset({ search: '' });
                                }}
                            >
                                <XMarkIcon className="h-5 w-5 text-wri-black" />
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </section>
    );
}
