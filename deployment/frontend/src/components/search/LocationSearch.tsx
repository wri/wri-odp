import { Disclosure, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Map } from 'react-map-gl'
import GeocoderControl from './GeocoderControl'
import { Dispatch, SetStateAction } from 'react'
import { SearchInput } from '@/schema/search.schema'
import { Filter } from '@/interfaces/search.interface'

export default function LocationSearch({
    setFilters,
    filters,
}: {
    setFilters: Dispatch<SetStateAction<Filter[]>>
    filters: Filter[]
}) {
    const initialValue = filters?.find((f) => f.key == 'spatial')?.label ?? ''
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
                        <Disclosure.Panel className="h-[300px] border-t-2 border-amber-400 ">
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
                                                    (f) => f.key == 'spatial'
                                                )

                                            if (filterIndex >= 0) {
                                                // @ts-ignore
                                                newFilters[filterIndex] = {
                                                    ...newFilters[filterIndex],
                                                    label: e.result.place_name,
                                                    value: e.result.geometry
                                                        .coordinates,
                                                }
                                            } else {
                                                newFilters.push({
                                                    key: 'spatial',
                                                    title: 'Location',
                                                    label: e.result.place_name,
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
                                                    (f) => f.key == 'spatial'
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
                        </Disclosure.Panel>
                    </Transition>
                </>
            )}
        </Disclosure>
    )
}
