import { Disclosure, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Map } from 'react-map-gl'
import GeocoderControl from './GeocoderControl'
import { Dispatch, SetStateAction } from 'react'
import { SearchInput } from '@/schema/search.schema'
import { Filter } from '@/interfaces/search.interface'
import classNames from '@/utils/classnames'

export default function LocationSearch({
    setFilters,
    filters,
}: {
    setFilters: Dispatch<SetStateAction<Filter[]>>
    filters: Filter[]
}) {
    const initialValue = filters?.find((f) => f.key == 'spatial')?.label ?? ''
    const locationFilterIndex = filters.findIndex((f) => f.key == 'spatial')
    const globalQValue = filters.find((f) => f.key == 'extGlobalQ')?.value
    function updateGlobalQ(value: string) {
        setFilters((prev) => {
            const newFilters = prev.length ? [...prev] : []

            const filterIndex = newFilters.findIndex(
                (f) => f.key == 'extGlobalQ'
            )
            if (value === 'only' && locationFilterIndex >= 0) {
                newFilters.splice(locationFilterIndex, 1)
            }

            if (filterIndex >= 0) {
                if (value === 'only' || value === 'exclude') {
                    newFilters[filterIndex] = {
                        title: 'Global',
                        key: 'extGlobalQ',
                        label: value === 'only' ? 'Only global' : 'Excluded',
                        value: value,
                    }
                } else {
                    newFilters.splice(filterIndex, 1)
                }
            } else {
                if (value === 'only' || value === 'exclude') {
                    newFilters.push({
                        key: 'extGlobalQ',
                        title: 'Global',
                        label: value === 'only' ? 'Only global' : 'Excluded',
                        value: value,
                    })
                } else {
                    newFilters.splice(filterIndex, 1)
                }
            }

            return newFilters
        })
    }
    return (
        <Disclosure
            as="div"
            className="border-b border-r border-stone-200 shadow"
            role="listitem"
        >
            {({ open }) => (
                <>
                    <Disclosure.Button className="flex h-16 w-full items-center gap-x-2 bg-white px-7 py-6">
                        <div className="flex h-16 w-full items-center gap-x-2">
                            <p className="font-['Acumin Pro SemiCondensed'] text-base font-normal text-black">
                                Location
                            </p>
                        </div>
                        <ChevronDownIcon
                            className={`${
                                open ? 'rotate-180 transform' : ''
                            } h-5 w-5 text-black`}
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
                        <Disclosure.Panel
                            className={classNames(
                                'border-t-2 border-amber-400',
                                globalQValue === 'only' ? '' : 'h-[300px]'
                            )}
                        >
                            <div className="px-7 py-3 space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                                <div className="flex items-center">
                                    <input
                                        name="notification-method"
                                        type="checkbox"
                                        onChange={() =>
                                            updateGlobalQ(
                                                globalQValue === 'only'
                                                    ? 'include'
                                                    : 'only'
                                            )
                                        }
                                        checked={globalQValue == 'only'}
                                        className="h-4 w-4 rounded border-gray-300 text-gray-500 focus:ring-gray-500"
                                    />
                                    <label className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                                        Only global
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        name="notification-method"
                                        type="checkbox"
                                        onChange={() =>
                                            updateGlobalQ(
                                                globalQValue === 'exclude'
                                                    ? 'include'
                                                    : 'exclude'
                                            )
                                        }
                                        checked={globalQValue == 'exclude'}
                                        className="h-4 w-4 rounded border-gray-300 text-gray-500 focus:ring-gray-500"
                                    />
                                    <label className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                                        Exclude global
                                    </label>
                                </div>
                            </div>
                            <div
                                className={classNames(
                                    globalQValue === 'only' ? 'hidden' : ''
                                )}
                            >
                                <Map
                                    mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjbHNueG5idGIwOXMzMmp0ZzE1NWVjZDV1In0.050LmRm-9m60lrzhpsKqNA"
                                    style={{ height: 300 }}
                                    mapStyle="mapbox://styles/mapbox/streets-v9"
                                >
                                    <GeocoderControl
                                        mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjbHNueG5idGIwOXMzMmp0ZzE1NWVjZDV1In0.050LmRm-9m60lrzhpsKqNA"
                                        position="bottom-right"
                                        onResult={(e) => {
                                            setFilters((prev) => {
                                                const newFilters = prev.length
                                                    ? [...prev]
                                                    : []

                                                const filterIndex =
                                                    newFilters.findIndex(
                                                        (f) =>
                                                            f.key == 'spatial'
                                                    )

                                                if (filterIndex >= 0) {
                                                    // @ts-ignore
                                                    newFilters[filterIndex] = {
                                                        ...newFilters[
                                                            filterIndex
                                                        ],
                                                        label: e.result
                                                            .place_name,
                                                        value: e.result.geometry
                                                            .coordinates,
                                                    }
                                                } else {
                                                    newFilters.push({
                                                        key: 'spatial',
                                                        title: 'Location',
                                                        label: e.result
                                                            .place_name,
                                                        value: e.result.geometry
                                                            .coordinates,
                                                    })
                                                }

                                                return newFilters
                                            })
                                        }}
                                        onClear={() => {
                                            setFilters((prev) => {
                                                const newFilters = prev.length
                                                    ? [...prev]
                                                    : []

                                                const filterIndex =
                                                    newFilters.findIndex(
                                                        (f) =>
                                                            f.key == 'spatial'
                                                    )

                                                if (filterIndex >= 0) {
                                                    newFilters.splice(
                                                        filterIndex,
                                                        1
                                                    )
                                                }

                                                return newFilters
                                            })
                                        }}
                                        initialValue={initialValue}
                                    />
                                </Map>
                            </div>
                        </Disclosure.Panel>
                    </Transition>
                </>
            )}
        </Disclosure>
    )
}
