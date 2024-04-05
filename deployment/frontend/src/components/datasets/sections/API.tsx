import { env } from '@/env.mjs'
import classNames from '@/utils/classnames'
import { useDataset } from '@/utils/storeHooks'
import { Tab } from '@headlessui/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import {
    SnippetEndpoint,
    QueryEndpoint,
    getJsSnippet,
    getPythonSnippet,
    getRSnippet,
    CkanApiMoreInfo,
    RwMoreInfo,
} from './APIEndpoint'
import { useFields } from '@/components/data-explorer/queryHooks'
import hljs from 'highlight.js/lib/core'

import python from 'highlight.js/lib/languages/python'
import js from 'highlight.js/lib/languages/javascript'
import r from 'highlight.js/lib/languages/r'

hljs.registerLanguage('python', python)
hljs.registerLanguage('javascript', js)
hljs.registerLanguage('r', r)

const tabs = ['Query', 'Javascript', 'Python', 'R']

export function API({ usecases }: { usecases?: string }) {
    return (
        <Tab.Group as="div">
            <Tab.List
                as="nav"
                className="-mt-4 flex h-12 w-full items-center bg-neutral-100 font-acumin overflow-x-auto"
            >
                {tabs.map((tab) => (
                    <Tab key={tab} as={Fragment}>
                        {({ selected }: { selected: boolean }) => (
                            <button
                                className={classNames(
                                    selected
                                        ? 'rounded-sm border-b border-wri-green bg-white'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'h-full whitespace-nowrap px-10 text-center text-base font-normal capitalize text-neutral-800'
                                )}
                            >
                                {tab}
                            </button>
                        )}
                    </Tab>
                ))}
                {usecases && (
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
            <Tab.Panel as="div" className="py-6 overflow-clip">
                <QueryInstructions />
            </Tab.Panel>
            <Tab.Panel as="div" className="py-6 overflow-clip">
                <SnippetInstructions
                    language="javascript"
                    getSnippetFn={getJsSnippet}
                />
            </Tab.Panel>
            <Tab.Panel as="div" className="py-6 overflow-clip">
                <SnippetInstructions
                    language="python"
                    getSnippetFn={getPythonSnippet}
                />
            </Tab.Panel>
            <Tab.Panel as="div" className="py-6 overflow-clip">
                <SnippetInstructions language="r" getSnippetFn={getRSnippet} />
            </Tab.Panel>
            {usecases && (
                <Tab.Panel as="div" className="py-6 overflow-clip">
                    <UseCases usecases={usecases} />
                </Tab.Panel>
            )}
        </Tab.Group>
    )
}

const QueryInstructions = () => {
    const { dataset } = useDataset()
    const { data } = useFields({
        id: dataset.rw_id,
        provider: dataset.provider,
    })

    let publicCkanUrl = env.NEXT_PUBLIC_CKAN_URL
    publicCkanUrl = publicCkanUrl.endsWith('/')
        ? publicCkanUrl.slice(0, -1)
        : publicCkanUrl

    const ckanBaseUrl = `${publicCkanUrl}/api/3/action`
    const ckanDatasetGetUrl = `${ckanBaseUrl}/package_show?id=${dataset.id}`

    const rwBaseUrl = `https://api.resourcewatch.org/v1`
    const rwDatasetGetUrl = `${rwBaseUrl}/dataset/${dataset.rw_id}`
    const rwFieldsUrl = `${rwBaseUrl}/fields/${dataset.rw_id}`
    const rwQueryUrl = `${rwBaseUrl}/query/${dataset.rw_id}?sql=SELECT * FROM ${data?.tableName} LIMIT 10`

    return (
        <>
            <h2 className="text-lg font-bold mb-5">Datasets API</h2>
            <QueryEndpoint
                description="Get this dataset's metadata"
                url={ckanDatasetGetUrl}
            />
            <QueryEndpoint
                description="Create a new Dataset"
                method="POST"
                url={`${publicCkanUrl}/api/3/action/package_create`}
                headers={{
                    Authorization: '<API_TOKEN>',
                }}
                body={`{
    "name": ${dataset.name},
    "title": ${dataset.title},
    "visibility_type": "public",
    "short_description": ${dataset.short_description},
    "technical_notes": ${dataset.technical_notes},
    "maintainer": ${dataset.maintainer},
    "maintainer_email": ${dataset.maintainer_email},
    "author": ${dataset.author},
    "resources": [
        {
            "format": "CSV",
            "name": "Test.csv",
            "description": "Test description",
            "type": "link",
            "url": "https://test.com/a_link_to_csv_file.csv",

        }
    ]
}`}
            />
            <QueryEndpoint
                description="Edit a Dataset"
                method="POST"
                url={`${publicCkanUrl}/api/3/action/package_patch`}
                headers={{
                    Authorization: '<API_TOKEN>',
                }}
                body={`{
    "id": "${dataset.id}",
    "name": "${dataset.name}",
    "title": "${dataset.title}+ - Edited",
    "visibility_type": "public",
    "short_description": "${dataset.short_description}",
    "technical_notes": "${dataset.technical_notes}",
    "maintainer": "${dataset.maintainer}",
    "maintainer_email": "${dataset.maintainer_email}",
    "author": "${dataset.author}",
    "resources": [
        {
            "format": "CSV",
            "name": "Test_Edited.csv",
            "description": "Test description Edited",
            "type": "link",
            "url": "https://test.com/a_link_to_csv_file_edited.csv",

        }
    ]
}`}
            />

            <CkanApiMoreInfo />

            {dataset.rw_id && (
                <>
                    <h2 className="text-lg font-bold mb-5 mt-10">
                        Resource Watch API
                    </h2>
                    <QueryEndpoint
                        description="Get the metadata stored on the Resource Watch API for this dataset"
                        url={rwDatasetGetUrl}
                    />

                    {dataset.provider && (
                        <>
                            <QueryEndpoint
                                description="Get this dataset's records metadata"
                                url={rwFieldsUrl}
                            />
                            <QueryEndpoint
                                description="Run a SQL query against this dataset's records"
                                url={rwQueryUrl}
                            />
                        </>
                    )}
                    <RwMoreInfo />
                </>
            )}
        </>
    )
}

hljs.registerLanguage('python', python)
hljs.registerLanguage('javascript', js)
hljs.registerLanguage('r', r)

const UseCases = ({ usecases }: { usecases: string }) => {
    const { dataset } = useDataset()
    const [highlighted, setHighlighted] = useState(false)
    const divRef = useRef<HTMLDivElement | null>(null)
    let publicCkanUrl = env.NEXT_PUBLIC_CKAN_URL
    publicCkanUrl = publicCkanUrl.endsWith('/')
        ? publicCkanUrl.slice(0, -1)
        : publicCkanUrl

    const ckanBaseUrl = `${publicCkanUrl}/api/3/action`
    const ckanDatasetGetUrl = `${ckanBaseUrl}/package_show?id=${dataset.id}`

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
                    __html: usecases.replaceAll(
                        '{% DATASET_URL %}',
                        ckanDatasetGetUrl
                    ),
                }}
            ></div>
        </div>
    )
}

const SnippetInstructions = ({
    language,
    getSnippetFn,
}: {
    language: 'javascript' | 'python' | 'r'
    getSnippetFn: (url: string, method?: string, body?: string) => string
}) => {
    const { dataset } = useDataset()
    const { data } = useFields({
        id: dataset.rw_id,
        provider: dataset.provider,
    })

    let publicCkanUrl = env.NEXT_PUBLIC_CKAN_URL
    publicCkanUrl = publicCkanUrl.endsWith('/')
        ? publicCkanUrl.slice(0, -1)
        : publicCkanUrl
    const ckanBaseUrl = `${publicCkanUrl}/api/3/action`

    const ckanPackageShowUrl = `${ckanBaseUrl}/package_show?id=${dataset.id}`
    const ckanPackageShowSnippet = getSnippetFn(ckanPackageShowUrl)

    const rwBaseUrl = `https://api.resourcewatch.org/v1`

    const rwDatasetGetUrl = `${rwBaseUrl}/dataset/${dataset.rw_id}`
    const rwGetDatasetSnippet = getSnippetFn(rwDatasetGetUrl)

    const rwGetFieldsUrl = `${rwBaseUrl}/fields/${dataset.rw_id}`
    const rwGetFieldsSnippet = getSnippetFn(rwGetFieldsUrl)

    const rwQueryUrl = `${rwBaseUrl}/query/${dataset.rw_id}?sql=SELECT * FROM ${data?.tableName} LIMIT 10`
    const rwQuerySnippet = getSnippetFn(rwQueryUrl)

    return (
        <>
            <h2 className="text-lg font-bold mb-5">Datasets API</h2>
            <SnippetEndpoint
                description="Get this dataset's metadata"
                snippet={ckanPackageShowSnippet}
                language={language}
            />
            <SnippetEndpoint
                description="Create a new Dataset"
                snippet={getSnippetFn(
                    `${ckanBaseUrl}/package_create`,
                    'POST',
                    JSON.stringify(
                        {
                            name: dataset.name,
                            title: dataset.title,
                            visibility_type: 'public',
                            short_description: dataset.short_description,
                            technical_notes: dataset.technical_notes,
                            maintainer: dataset.maintainer,
                            maintainer_email: dataset.maintainer_email,
                            author: dataset.author,
                            resources: [
                                {
                                    format: 'CSV',
                                    name: 'Test.csv',
                                    description: 'Test description',
                                    type: 'link',
                                    url: 'https://test.com/a_link_to_csv_file.csv',
                                },
                            ],
                        },
                        null,
                        4
                    ).replace(/\n/g, `\n${' '.repeat(8)}`)
                )}
                language={language}
            />

            <SnippetEndpoint
                description="Edit a Dataset"
                snippet={getSnippetFn(
                    `${ckanBaseUrl}/package_patch`,
                    'POST',
                    JSON.stringify(
                        {
                            name: dataset.name,
                            title: dataset.title,
                            visibility_type: 'public',
                            short_description:
                                dataset.short_description + ' - Edited',
                            technical_notes: dataset.technical_notes,
                            maintainer: dataset.maintainer,
                            maintainer_email: dataset.maintainer_email,
                            author: dataset.author,
                            resources: [
                                {
                                    format: 'CSV',
                                    name: 'Test_Edited.csv',
                                    description: 'Test description -Edited',
                                    type: 'link',
                                    url: 'https://test.com/a_link_to_csv_file_edited.csv',
                                },
                            ],
                        },
                        null,
                        4
                    ).replace(/\n/g, `\n${' '.repeat(8)}`)
                )}
                language={language}
            />
            <CkanApiMoreInfo />

            {dataset.rw_id && (
                <>
                    <h2 className="text-lg font-bold mb-5 mt-10">
                        Resource Watch API
                    </h2>
                    <SnippetEndpoint
                        description="Get the metadata stored on the Resource Watch API for this dataset"
                        snippet={rwGetDatasetSnippet}
                        language={language}
                    />

                    {dataset.provider && (
                        <>
                            <SnippetEndpoint
                                description="Get this dataset's records metadata"
                                snippet={rwGetFieldsSnippet}
                                language={language}
                            />
                            <SnippetEndpoint
                                description="Run a SQL query against this dataset's records"
                                snippet={rwQuerySnippet}
                                language={language}
                            />
                        </>
                    )}
                    <RwMoreInfo />
                </>
            )}
        </>
    )
}
