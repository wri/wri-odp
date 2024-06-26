import dynamic from 'next/dynamic'
const Modal = dynamic(() => import('@/components/_shared/Modal'), {
    ssr: false,
})
import { Tab } from '@headlessui/react'
import { BookOpenIcon } from '@heroicons/react/24/outline'
import { Fragment, useEffect, useRef, useState } from 'react'
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
import hljs from 'highlight.js/lib/core'

import python from 'highlight.js/lib/languages/python'
import js from 'highlight.js/lib/languages/javascript'
import r from 'highlight.js/lib/languages/r'

hljs.registerLanguage('python', python)
hljs.registerLanguage('javascript', js)
hljs.registerLanguage('r', r)

export function MoreInfo({ gfwapiurl }: { gfwapiurl?: boolean }) {
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
                .{' '}
                {gfwapiurl ? (
                    <>
                        Also see{' '}
                        <a
                            href="https://www.globalforestwatch.org/help/developers/guides/create-and-use-an-api-key/"
                            target="_blank"
                            rel="noreferrer"
                            className=" text-blue-700 italic underline"
                        >
                            GFW API key documentation
                        </a>{' '}
                        to generate api token to access raw file.
                    </>
                ) : (
                    ''
                )}
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
                        {datafile.advanced_api_usage && (
                            <Tab key="Usecases" as={Fragment}>
                                {({ selected }: { selected: boolean }) => (
                                    <button
                                        className={classNames(
                                            selected
                                                ? 'rounded-sm border-b border-wri-green bg-white'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                            'h-full whitespace-nowrap px-8 text-center text-base font-normal capitalize text-neutral-800'
                                        )}
                                    >
                                        Advanced API Usage
                                    </button>
                                )}
                            </Tab>
                        )}
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
                        {datafile.advanced_api_usage && (
                            <Tab.Panel as="div" className="py-6 overflow-clip">
                                <AdvancedApiUsage
                                    advancedApiUsage={
                                        datafile.advanced_api_usage
                                    }
                                    datafileId={datafile.id}
                                />
                            </Tab.Panel>
                        )}
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </Modal>
    )
}

const AdvancedApiUsage = ({
    advancedApiUsage,
    datafileId,
}: {
    advancedApiUsage: string
    datafileId: string
}) => {
    const [highlighted, setHighlighted] = useState(false)
    const divRef = useRef<HTMLDivElement | null>(null)
    let publicCkanUrl = env.NEXT_PUBLIC_CKAN_URL
    publicCkanUrl = publicCkanUrl.endsWith('/')
        ? publicCkanUrl.slice(0, -1)
        : publicCkanUrl

    const ckanBaseUrl = `${publicCkanUrl}/api/3/action`
    const ckanResourcGetUrl = `${ckanBaseUrl}/resource_show?id=${datafileId}`

    useEffect(() => {
        if (!highlighted && divRef.current) {
            setHighlighted(true)
            hljs.highlightAll()
        }
    }, [highlighted])
    return (
        <div>
            <div
                ref={divRef}
                className="prose w-full max-w-7xl prose-sm prose-a:text-wri-green prose-pre:bg-pre-code prose-pre:text-black prose-pre:text-base"
                dangerouslySetInnerHTML={{
                    __html: advancedApiUsage.replaceAll(
                        '{% DATAFILE_URL %}',
                        ckanResourcGetUrl
                    ),
                }}
            ></div>
        </div>
    )
}
const QueryInstructions = ({ datafile }: { datafile: Resource }) => {
    let publicCkanUrl = env.NEXT_PUBLIC_CKAN_URL
    publicCkanUrl = publicCkanUrl.endsWith('/')
        ? publicCkanUrl.slice(0, -1)
        : publicCkanUrl
    const ckanBaseUrl = `${publicCkanUrl}/api/3/action`
    const ckanResourcGetUrl = `${ckanBaseUrl}/resource_show?id=${datafile.id}`
    let ckanResourcGetFileUrl: string | undefined
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

    const formRef = useRef<HTMLFormElement>(null)

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()

        if (ckanResourcGetFileUrl && formRef.current) {
            const url = new URL(ckanResourcGetFileUrl)

            url.searchParams.forEach((value, key) => {
                const input = document.createElement('input')
                input.type = 'hidden'
                input.name = key
                input.value = value
                formRef.current?.appendChild(input)
            })

            if (
                ckanResourcGetFileUrl.startsWith(
                    'https://data-api.globalforestwatch.org'
                )
            ) {
                const input = document.createElement('input')
                input.type = 'hidden'
                input.name = 'x-api-key'
                input.value = env.NEXT_PUBLIC_GFW_API_KEY
                formRef.current?.appendChild(input)
            }

            formRef.current.action = url.toString()
            formRef.current.submit()
        }
    }

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
                <div>
                    <a
                        href="#"
                        onClick={handleClick}
                        style={{ cursor: 'pointer' }}
                    >
                        {ckanResourcGetFileUrl.startsWith(
                            'https://data-api.globalforestwatch.org'
                        ) ? (
                            <QueryEndpoint
                                description="Get raw file"
                                url={ckanResourcGetFileUrl}
                                method="GET"
                                headers={{
                                    Authorization: '<API_TOKEN>',
                                }}
                            />
                        ) : (
                            <QueryEndpoint
                                description="Get raw file"
                                url={ckanResourcGetFileUrl}
                                method="GET"
                            />
                        )}
                    </a>
                    <form
                        ref={formRef}
                        method="GET"
                        target="_blank"
                        style={{ display: 'none' }}
                    />
                </div>
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

            <MoreInfo
                gfwapiurl={ckanResourcGetFileUrl.startsWith(
                    'https://data-api.globalforestwatch.org'
                )}
            />

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
                <>
                    {datafile.url?.startsWith(
                        'https://data-api.globalforestwatch.org'
                    ) ? (
                        <SnippetEndpoint
                            description="Get raw file"
                            snippet={getSnippetFn(
                                datafile.url,
                                'GET',
                                JSON.stringify({})
                            )}
                            language={language}
                        />
                    ) : (
                        <SnippetEndpoint
                            description="Get raw file"
                            snippet={ckanResourcGetFileSnippet}
                            language={language}
                        />
                    )}
                </>
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

            <MoreInfo
                gfwapiurl={datafile.url?.startsWith(
                    'https://data-api.globalforestwatch.org'
                )}
            />

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
