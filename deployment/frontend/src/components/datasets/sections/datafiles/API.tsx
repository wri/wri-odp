import dynamic from 'next/dynamic'
const Modal = dynamic(() => import('@/components/_shared/Modal'), {
    ssr: false,
})
import { Tab } from '@headlessui/react'
import { BookOpenIcon } from '@heroicons/react/24/outline'
import { Fragment, useState } from 'react'
import classNames from '@/utils/classnames'
import { env } from '@/env.mjs'
import { Resource } from '@/interfaces/dataset.interface'
import {
    SnippetEndpoint,
    QueryEndpoint,
    getJsSnippet,
    getPythonSnippet,
    getRSnippet,
    RwMoreInfo,
} from '../APIEndpoint'

export function MoreInfo() {
    return (
        <div>
            <div className="font-acumin text-base font-normal text-zinc-800">
                For more information on the CKAN API, see the{' '}
                <a
                    href="https://docs.ckan.org/en/2.10/api/index.html"
                    target="_blank"
                    rel="noreferrer"
                    className=" text-blue-700 italic underline"
                >
                    CKAN API documentation
                </a>{' '}
                and for Datastore API see the{' '}
                <a
                    href="https://docs.ckan.org/en/2.10/maintaining/datastore.html"
                    target="_blank"
                    rel="noreferrer"
                    className=" text-blue-700 italic underline"
                >
                    Datastore API documentation
                </a>
            </div>
        </div>
    )
}

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
    const tabs = [
        { name: 'Query' },
        { name: 'JavaScript' },
        { name: 'Python' },
        { name: 'R' },
    ]
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
                            <SnippetInstructions
                                datafile={datafile}
                                language="javascript"
                                getSnippetFn={getJsSnippet}
                            />
                        </Tab.Panel>
                        <Tab.Panel>
                            <SnippetInstructions
                                datafile={datafile}
                                language="python"
                                getSnippetFn={getPythonSnippet}
                            />
                        </Tab.Panel>
                        <Tab.Panel>
                            <SnippetInstructions
                                datafile={datafile}
                                language="r"
                                getSnippetFn={getRSnippet}
                            />
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </Modal>
    )
}

const QueryInstructions = ({ datafile }: { datafile: Resource }) => {
    let publicCkanUrl = env.NEXT_PUBLIC_CKAN_URL
    publicCkanUrl = publicCkanUrl.endsWith('/')
        ? publicCkanUrl.slice(0, -1)
        : publicCkanUrl
    const ckanBaseUrl = `${publicCkanUrl}/api/3/action`
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

            <QueryEndpoint
                description="update this data file's metadata"
                url={`${ckanBaseUrl}/resource_patch`}
                method="POST"
                headers={{
                    Authorization: '<API_TOKEN>',
                }}
                body={`{
    "id": "${datafile.id}",
    "title": "${datafile.title ?? datafile.name} -Edited",
    "description": "${datafile.description} Edited",
}`}
                lang={'json'}
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

            <MoreInfo />

            {datafile.rw_id && (
                <>
                    <h2 className="text-lg font-bold mb-5 mt-10">
                        Resource Watch API
                    </h2>

                    <QueryEndpoint
                        description="Get the layer object associated with this data file"
                        url={rwDatasetGetLayerUrl}
                    />
                    <RwMoreInfo />
                </>
            )}
        </>
    )
}

const SnippetInstructions = ({
    datafile,
    getSnippetFn,
    language,
}: {
    datafile: Resource
    getSnippetFn: (url: string, method?: string, body?: string) => string
    language: 'javascript' | 'python' | 'r'
}) => {
    let publicCkanUrl = env.NEXT_PUBLIC_CKAN_URL
    publicCkanUrl = publicCkanUrl.endsWith('/')
        ? publicCkanUrl.slice(0, -1)
        : publicCkanUrl
    const ckanBaseUrl = `${publicCkanUrl}/api/3/action`
    const ckanResourcGetUrl = `${ckanBaseUrl}/resource_show?id=${datafile.id}`
    const ckanResourcGetSnippet = getSnippetFn(ckanResourcGetUrl)

    let ckanResourcGetFileUrl
    let ckanResourcGetFileSnippet

    if (datafile.url) {
        ckanResourcGetFileUrl = datafile.url
        ckanResourcGetFileSnippet = getSnippetFn(datafile.url)
    }

    let ckanGetDatastoreInfoUrl
    let ckanGetDatastoreInfoSnippet

    let ckanResourceGetDatastoreSearchUrl
    let ckanResourceGetDatastoreSearchSnippet

    let ckanResourceGetDatastoreSqlUrl
    let ckanResourceGetDatastoreSqlSnippet

    if (datafile.datastore_active) {
        ckanGetDatastoreInfoUrl = `${ckanBaseUrl}/datastore_info`
        ckanGetDatastoreInfoSnippet = getSnippetFn(
            ckanGetDatastoreInfoUrl,
            'POST',
            `{ "id": "${datafile.id}" }`
        )

        ckanResourceGetDatastoreSearchUrl = `${ckanBaseUrl}/datastore_search?resource_id=${datafile.id}&q=foo`
        ckanResourceGetDatastoreSearchSnippet = getSnippetFn(
            ckanResourceGetDatastoreSearchUrl
        )

        ckanResourceGetDatastoreSqlUrl = `${ckanBaseUrl}/datastore_search_sql?sql=SELECT * FROM "${datafile.id}" LIMIT 10`
        ckanResourceGetDatastoreSqlSnippet = getSnippetFn(
            ckanResourceGetDatastoreSqlUrl
        )
    }

    const rwBaseUrl = `https://api.resourcewatch.org/v1`

    const rwDatasetGetLayerUrl = `${rwBaseUrl}/layer/${datafile.rw_id}`
    const rwDatasetGetLayerSnippet = getSnippetFn(rwDatasetGetLayerUrl)

    return (
        <>
            <h2 className="text-lg font-bold mb-5">Data Files API</h2>
            <SnippetEndpoint
                description="Edit this data file's metadata"
                snippet={getSnippetFn(
                    `${ckanBaseUrl}/resource_patch`,
                    'POST',
                    JSON.stringify(
                        {
                            id: datafile.id,
                            title: datafile.title ?? datafile.name + 'Edited',
                            description: datafile.description + ' Edited',
                        },
                        null,
                        4
                    ).replace(/\n/g, `\n${' '.repeat(8)}`)
                )}
                language={language}
            />
            <SnippetEndpoint
                description="Get this data file's metadata"
                snippet={ckanResourcGetSnippet}
                language={language}
            />
            {ckanResourcGetFileSnippet && (
                <SnippetEndpoint
                    description="Get raw file"
                    snippet={ckanResourcGetFileSnippet}
                    language={language}
                />
            )}
            {ckanGetDatastoreInfoSnippet && (
                <SnippetEndpoint
                    description="Get this data file's records metadata"
                    snippet={ckanGetDatastoreInfoSnippet}
                    language={language}
                />
            )}
            {ckanResourceGetDatastoreSearchSnippet && (
                <SnippetEndpoint
                    description="Search this data file's records"
                    snippet={ckanResourceGetDatastoreSearchSnippet}
                    language={language}
                />
            )}

            {ckanResourceGetDatastoreSqlSnippet && (
                <SnippetEndpoint
                    description="Run a SQL query against this data file's records"
                    snippet={ckanResourceGetDatastoreSqlSnippet}
                    language={language}
                />
            )}

            <MoreInfo />

            {datafile.rw_id && (
                <>
                    <h2 className="text-lg font-bold mb-5 mt-10">
                        Resource Watch API
                    </h2>

                    <SnippetEndpoint
                        description="Get the layer object associated with this data file"
                        snippet={rwDatasetGetLayerSnippet}
                        language={language}
                    />
                    <RwMoreInfo />
                </>
            )}
        </>
    )
}
