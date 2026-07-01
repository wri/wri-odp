import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import React, { useState } from 'react';
import DatasetList from './DatasetList';
import ActivityStreamList from '../_shared/ActivityStreamList';
import { api } from '@/utils/api';
import { type SearchInput } from '@/schema/search.schema';

export default function TeamTab() {
    const [query, setQuery] = useState<SearchInput>({
        search: '',
        page: { start: 0, rows: 0 },
        fq: {},
    });

    const { data, isLoading } = api.dataset.getAllDataset.useQuery(query);

    return (
        <section
            id="teamtab"
            className="w-full max-w-9xl xxl:mx-auto mt-10 font-acumin "
        >
            <TabGroup>
                <TabList className="flex max-w-9xl">
                    <Tab className=" bg-wri-green text-white font-semibold text-[1.063rem] w-[50%] sm:w-[316px]">
                        {({ selected }) => (
                            <div
                                className={`font-semibold  px-6 py-4 focus:outline-0 w-full  ${
                                    selected ? ' bg-wri-dark-green' : ''
                                } `}
                            >
                                Datasets
                            </div>
                        )}
                    </Tab>
                    <Tab className=" bg-wri-green text-white font-semibold text-[1.063rem] w-[50%] sm:w-[316px]">
                        {({ selected }) => (
                            <div
                                className={`font-semibold  px-6 py-4 focus:outline-0 w-full  ${
                                    selected ? ' bg-wri-dark-green' : ''
                                } `}
                            >
                                Activity stream
                            </div>
                        )}
                    </Tab>
                </TabList>
                <TabPanels className="mt-2">
                    <TabPanel className="">
                        {data?.datasets && (
                            <DatasetList datasets={data?.datasets} />
                        )}
                    </TabPanel>
                    <TabPanel className="">
                        <ActivityStreamList />,
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </section>
    );
}
