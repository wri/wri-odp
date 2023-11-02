import Facet from '@/components/search/Facet'
import FiltersSelected from '@/components/search/FiltersSelected'
import LocationSearch from '@/components/search/LocationSearch'

export default function FiltersPanel() {
    return (
        <div className='mt-6 pr-6'>
            <FiltersSelected />
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white pb-4 mt-4">
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list">
                                <LocationSearch />
                                <Facet
                                    text="Resolution"
                                    options={[
                                        {
                                            label: 'Something',
                                            value: '1m',
                                        },
                                        {
                                            label: 'Lorem Ipsum',
                                            value: '2m',
                                        },
                                        {
                                            label: 'Another thing',
                                            value: '3m',
                                        },
                                    ]}
                                />
                                <Facet
                                    text="Topic"
                                    options={[
                                        {
                                            label: '2020',
                                            value: '2020',
                                        },
                                        {
                                            label: '2021',
                                            value: '2021',
                                        },
                                        {
                                            label: '2022',
                                            value: '2022',
                                        },
                                    ]}
                                />
                                <Facet
                                    text="Team"
                                    options={[
                                        {
                                            label: '2020',
                                            value: '2020',
                                        },
                                        {
                                            label: '2021',
                                            value: '2021',
                                        },
                                        {
                                            label: '2022',
                                            value: '2022',
                                        },
                                    ]}
                                />
                                <Facet
                                    text="Temporal coverage"
                                    options={[
                                        {
                                            label: '2020',
                                            value: '2020',
                                        },
                                        {
                                            label: '2021',
                                            value: '2021',
                                        },
                                        {
                                            label: '2022',
                                            value: '2022',
                                        },
                                    ]}
                                />
                                <Facet
                                    text="License"
                                    options={[
                                        {
                                            label: '2020',
                                            value: '2020',
                                        },
                                        {
                                            label: '2021',
                                            value: '2021',
                                        },
                                        {
                                            label: '2022',
                                            value: '2022',
                                        },
                                    ]}
                                />
                                <Facet
                                    text="Format"
                                    options={[
                                        {
                                            label: '2020',
                                            value: '2020',
                                        },
                                        {
                                            label: '2021',
                                            value: '2021',
                                        },
                                        {
                                            label: '2022',
                                            value: '2022',
                                        },
                                    ]}
                                />
                                <Facet
                                    text="Tags"
                                    options={[
                                        {
                                            label: '2020',
                                            value: '2020',
                                        },
                                        {
                                            label: '2021',
                                            value: '2021',
                                        },
                                        {
                                            label: '2022',
                                            value: '2022',
                                        },
                                    ]}
                                />
                            </ul>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}
