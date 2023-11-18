import { Filter } from '@/interfaces/search.interface';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Input } from '../_shared/SimpleInput';
import notify from '@/utils/notify'

export default function MetadataModifiedFacet({
    setFilters,
    filters,
}: {
    setFilters: Dispatch<SetStateAction<Filter[]>>;
    filters: Filter[];
}) {
    const getUpdatedState = () => {
        const sinceValue = filters.find(f => f?.key === 'metadata_modified_since')?.value ?? '';
        const beforeValue = filters.find(f => f?.key === 'metadata_modified_before')?.value ?? '';

        return { metadata_modified_since: sinceValue, metadata_modified_before: beforeValue };
    };

    const [optionsState, setOptionsState] = useState<{
        metadata_modified_since?: string;
        metadata_modified_before?: string;
    }>(getUpdatedState());

    useEffect(() => {
        setOptionsState(getUpdatedState());
    }, [filters]);

    const handleDateChange = (key: string, value: string) => {
        setOptionsState(prev => ({ ...prev, [key]: value }));

        const newSince = key === 'metadata_modified_since' ? value : optionsState.metadata_modified_since;
        const newBefore = key === 'metadata_modified_before' ? value : optionsState.metadata_modified_before;

        if (newSince && newBefore && new Date(newSince) > new Date(newBefore)) {
            notify('Invalid date range: "Since" date must be before the "Before" date.', 'error');
            setOptionsState(prev => ({ ...prev, [key]: '' }));
            return;
        }
  
        if (newSince && new Date(newSince) > new Date()) {
            notify('Invalid date range: "Since" date must be today or in the past.', 'error');
            setOptionsState(prev => ({ ...prev, [key]: '' }));
            return;
        }

        const newFilters = filters.filter(f => f.key !== key);

        if (value) {
            newFilters.push({
                key,
                title: 'Last Updated ' + (key.endsWith('_since') ? 'Since' : 'Before'),
                value,
                label: value,
            });
        }
        setFilters(newFilters);
    };

    return (
        <Disclosure as="div" className="border-b border-r border-stone-200 shadow">
            {({ open }) => (
                <>
                    <Disclosure.Button className="flex h-16 w-full items-center gap-x-2 bg-white px-7 py-6">
                        <div className="flex h-16 w-full items-center gap-x-2">
                            <p className="font-['Acumin Pro SemiCondensed'] text-base font-normal text-black">
                                Last Updated
                            </p>
                        </div>
                        <ChevronDownIcon
                            className={`${open ? 'rotate-180 transform transition' : ''} h-5 w-5 text-black`}
                        />
                    </Disclosure.Button>
                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <Disclosure.Panel className="border-t-2 border-amber-400 bg-white px-7 pb-2 text-sm text-gray-500">
                            <fieldset>
                                <div className="mt-2">
                                    <div
                                        key={'metadata_modified_since'}
                                        className="relative flex items-start py-1 mb-1"
                                    >
                                        <div className="min-w-0 flex-1 text-sm leading-6">
                                            <label className="select-none font-medium text-gray-900">
                                                Since
                                            </label>
                                        </div>
                                        <div className="mr-3 flex h-6 items-center">
                                            <Input
                                                id="since-date"
                                                type="date"
                                                className="h-8 w-[8rem] rounded border-gray-300 text-gray-500 focus:ring-gray-500 px-3"
                                                value={optionsState.metadata_modified_since}
                                                onChange={e => handleDateChange('metadata_modified_since', e.target.value)}
                                                placeholder='mm/dd/yyyy'
                                            />
                                        </div>
                                    </div>
                                    <div
                                        key={'metadata_modified_before'}
                                        className="relative flex items-start py-1"
                                    >
                                        <div className="min-w-0 flex-1 text-sm leading-6">
                                            <label className="select-none font-medium text-gray-900">
                                                Before
                                            </label>
                                        </div>
                                        <div className="mr-3 flex h-6 items-center">
                                            <Input
                                                id="before-date"
                                                type="date"
                                                className="h-8 w-[8rem] rounded border-gray-300 text-gray-500 focus:ring-gray-500 px-3"
                                                value={optionsState.metadata_modified_before}
                                                onChange={e => handleDateChange('metadata_modified_before', e.target.value)}
                                                placeholder='mm/dd/yyyy'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                        </Disclosure.Panel>
                    </Transition>
                </>
            )}
        </Disclosure>
    );
}
