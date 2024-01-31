import Modal from '@/components/_shared/Modal'
import { Tab } from '@headlessui/react'
import { BookOpenIcon } from '@heroicons/react/24/outline'
import { Fragment, useState } from 'react'
import classNames from '@/utils/classnames'
import { env } from '@/env.mjs'
import { Resource } from '@/interfaces/dataset.interface'
import { JsEndpoint, QueryEndpoint, getSnippet } from '../APIEndpoint'

export function APIButton({ datafile }: { datafile: Resource }) {
    const [open, setOpen] = useState(false)
    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="w-full flex aspect-square flex-col items-center justify-center md:gap-y-2 rounded-sm border-2 border-wri-green bg-white shadow transition hover:bg-amber-400"
            >
                <BookOpenIcon className="h-5 sm:h-9" />
                <div className="font-acumin text-xs sm:text-sm font-normal text-black">
                    API Endpoints
                </div>
                <div className="h-4 font-acumin text-xs font-normal text-black"></div>
            </button>
            <OpenInModal open={open} setOpen={setOpen} datafile={datafile} />
        </>
    )
}

function OpenInModal({
    open,
    setOpen,
    datafile,
}: {
    open: boolean
    setOpen: (open: boolean) => void
    datafile: Resource
}) {
    const tabs = [{ name: 'Query' }, { name: 'JavaScript' }]
    return (
        <Modal open={open} setOpen={setOpen} className="max-w-[64rem]">
            <div className="flex flex-col gap-y-4 p-5 font-acumin">
                <div className="font-['Acumin Pro SemiCondensed'] text-3xl font-normal text-black">
                    API
                </div>
                <Tab.Group>
                    <Tab.List
                        as="nav"
                        className="mt-6 flex border-b border-zinc-300"
                    >
                        {tabs.map((tab) => (
                            <Tab as={Fragment}>
                                {({ selected }: { selected: boolean }) => (
                                    <button
                                        className={classNames(
                                            selected
                                                ? 'border-blue-800 text-blue-800'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                            'whitespace-nowrap border-b-2 px-6 font-acumin font-semibold transition'
                                        )}
                                    >
                                        {tab.name}
                                    </button>
                                )}
                            </Tab>
                        ))}
                    </Tab.List>
                    <Tab.Panels
                        as="div"
                        className="max-h-[500px] overflow-y-auto"
                    >
                        <Tab.Panel>
                            <QueryInstructions datafile={datafile} />
                        </Tab.Panel>
                        <Tab.Panel>
                            <JavascriptInstructions datafile={datafile} />
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </Modal>
    )
}

const QueryInstructions = ({ datafile }: { datafile: Resource }) => {
    const ckanBaseUrl = `${env.NEXT_PUBLIC_CKAN_URL}/api/3/action`
    const ckanResourcGetUrl = `${ckanBaseUrl}/resource_show?id=${datafile.id}`
    let ckanResourcGetFileUrl
    if (datafile.url) {
        ckanResourcGetFileUrl = datafile.url
    }

    let ckanGetDatastoreInfoUrl
    let ckanResourceGetDatastoreSearchUrl
    let ckanResourceGetDatastoreSqlUrl
    if (datafile.datastore_active) {
        ckanGetDatastoreInfoUrl = `${ckanBaseUrl}/datastore_info`
        ckanResourceGetDatastoreSearchUrl = `${ckanBaseUrl}/datastore_search?resource_id=${datafile.id}&q=foo`
        ckanResourceGetDatastoreSqlUrl = `${ckanBaseUrl}/datastore_search_sql?sql=SELECT * FROM "${datafile.id}" LIMIT 10`
    }

    const rwBaseUrl = `https://api.resourcewatch.org/v1`
    const rwDatasetGetLayerUrl = `${rwBaseUrl}/layer/${datafile.rw_id}`

    return (
        <>
            <h2 className="text-lg font-bold mb-5">Data Files API</h2>
            <QueryEndpoint
                description="Get this data file's metadata"
                url={ckanResourcGetUrl}
            />
            {ckanResourcGetFileUrl && (
                <QueryEndpoint
                    description="Get raw file"
                    url={ckanResourcGetFileUrl}
                />
            )}
            {ckanGetDatastoreInfoUrl && (
                <QueryEndpoint
                    description="Get this data file's records metadata"
                    url={ckanGetDatastoreInfoUrl}
                    method="POST"
                    body={`{ 
    "id": "${datafile.id}" 
}`}
                    lang={'json'}
                />
            )}
            {ckanResourceGetDatastoreSearchUrl && (
                <QueryEndpoint
                    description="Search this data file's records"
                    url={ckanResourceGetDatastoreSearchUrl}
                />
            )}

            {ckanResourceGetDatastoreSqlUrl && (
                <QueryEndpoint
                    description="Run a SQL query against this data file's records"
                    url={ckanResourceGetDatastoreSqlUrl}
                />
            )}

            {datafile.rw_id && (
                <>
                    <h2 className="text-lg font-bold mb-5 mt-10">
                        Resource Watch API
                    </h2>

                    <QueryEndpoint
                        description="Get the layer object associated with this data file"
                        url={rwDatasetGetLayerUrl}
                    />
                </>
            )}
        </>
    )
}

const JavascriptInstructions = ({ datafile }: { datafile: Resource }) => {
    const ckanBaseUrl = `${env.NEXT_PUBLIC_CKAN_URL}/api/3/action`
    const ckanResourcGetUrl = `${ckanBaseUrl}/resource_show?id=${datafile.id}`
    const ckanResourcGetSnippet = getSnippet(ckanResourcGetUrl)

    let ckanResourcGetFileUrl
    let ckanResourcGetFileSnippet

    if (datafile.url) {
        ckanResourcGetFileUrl = datafile.url
        ckanResourcGetFileSnippet = getSnippet(datafile.url)
    }

    let ckanGetDatastoreInfoUrl
    let ckanGetDatastoreInfoSnippet

    let ckanResourceGetDatastoreSearchUrl
    let ckanResourceGetDatastoreSearchSnippet

    let ckanResourceGetDatastoreSqlUrl
    let ckanResourceGetDatastoreSqlSnippet

    if (datafile.datastore_active) {
        ckanGetDatastoreInfoUrl = `${ckanBaseUrl}/datastore_info`
        ckanGetDatastoreInfoSnippet = getSnippet(
            ckanGetDatastoreInfoUrl,
            'POST',
            `{ "id": "${datafile.id}" }`
        )

        ckanResourceGetDatastoreSearchUrl = `${ckanBaseUrl}/datastore_search?resource_id=${datafile.id}&q=foo`
        ckanResourceGetDatastoreSearchSnippet = getSnippet(
            ckanResourceGetDatastoreSearchUrl
        )

        ckanResourceGetDatastoreSqlUrl = `${ckanBaseUrl}/datastore_search_sql?sql=SELECT * FROM "${datafile.id}" LIMIT 10`
        ckanResourceGetDatastoreSqlSnippet = getSnippet(
            ckanResourceGetDatastoreSqlUrl
        )
    }

    const rwBaseUrl = `https://api.resourcewatch.org/v1`

    const rwDatasetGetLayerUrl = `${rwBaseUrl}/layer/${datafile.rw_id}`
    const rwDatasetGetLayerSnippet = getSnippet(rwDatasetGetLayerUrl)

    return (
        <>
            <h2 className="text-lg font-bold mb-5">Data Files API</h2>
            <JsEndpoint
                description="Get this data file's metadata"
                snippet={ckanResourcGetSnippet}
            />
            {ckanResourcGetFileSnippet && (
                <JsEndpoint
                    description="Get raw file"
                    snippet={ckanResourcGetFileSnippet}
                />
            )}
            {ckanGetDatastoreInfoSnippet && (
                <JsEndpoint
                    description="Get this data file's records metadata"
                    snippet={ckanGetDatastoreInfoSnippet}
                />
            )}
            {ckanResourceGetDatastoreSearchSnippet && (
                <JsEndpoint
                    description="Search this data file's records"
                    snippet={ckanResourceGetDatastoreSearchSnippet}
                />
            )}

            {ckanResourceGetDatastoreSqlSnippet && (
                <JsEndpoint
                    description="Run a SQL query against this data file's records"
                    snippet={ckanResourceGetDatastoreSqlSnippet}
                />
            )}

            {datafile.rw_id && (
                <>
                    <h2 className="text-lg font-bold mb-5 mt-10">
                        Resource Watch API
                    </h2>

                    <JsEndpoint
                        description="Get the layer object associated with this data file"
                        snippet={rwDatasetGetLayerSnippet}
                    />
                </>
            )}
        </>
    )
}
