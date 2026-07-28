import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedRadius,
    getThemedSpacing,
    TabBar,
} from '@worldresources/wri-design-systems';
import {
    ChevronDownIcon,
    ClipboardDocumentIcon,
    ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { env } from '@/env.mjs';
import { type WriDataset } from '@/schema/ckan.schema';
import {
    getJsSnippet,
    getPythonSnippet,
    getRSnippet,
} from '@/components/datasets/sections/APIEndpoint';
import { formatDate } from '../download-utils';
import { useFields } from '@/components/data-explorer/queryHooks';

type SelectEndpointsProps = {
    dataset: WriDataset;
    onBack: () => void;
    onClose: () => void;
};

type CodeTab = 'javascript' | 'python' | 'r';

function SelectEndpoints({ dataset, onBack, onClose }: SelectEndpointsProps) {
    const [expandedByIndex, setExpandedByIndex] = useState<Record<number, boolean>>({});
    const [selectedTabByIndex, setSelectedTabByIndex] = useState<Record<number, CodeTab>>({});

    const { data } = useFields({
        id: dataset.rw_id ?? '',
        provider: dataset.provider ?? '',
    });

    let publicCkanUrl = env.NEXT_PUBLIC_CKAN_URL;
    publicCkanUrl = publicCkanUrl.endsWith('/') ? publicCkanUrl.slice(0, -1) : publicCkanUrl;

    const ckanBaseUrl = `${publicCkanUrl}/api/3/action`;
    const ckanDatasetGetUrl = `${ckanBaseUrl}/package_show?id=${dataset.name}`;

    const rwBaseUrl = 'https://api.resourcewatch.org/v1';
    const rwDatasetGetUrl = `${rwBaseUrl}/dataset/${dataset.rw_id}`;
    const rwFieldsUrl = `${rwBaseUrl}/fields/${dataset.rw_id}`;
    const rwQueryUrl = `${rwBaseUrl}/query/${dataset.rw_id}?sql=SELECT * FROM ${data?.tableName} LIMIT 10`;

    const endpoints: { title: string; description: string; url: string }[] = [
        {
            title: 'Dataset metadata',
            description: "Get this dataset's metadata.",
            url: ckanDatasetGetUrl,
        },
        ...(dataset.rw_id
            ? [
                  {
                      title: 'RW dataset metadata',
                      description:
                          'Get the metadata stored on the Resource Watch API for this dataset.',
                      url: rwDatasetGetUrl,
                  },
              ]
            : []),
        ...(dataset.rw_id && dataset.provider
            ? [
                  {
                      title: 'Records metadata',
                      description: "Get this dataset's records metadata.",
                      url: rwFieldsUrl,
                  },
                  {
                      title: 'SQL query',
                      description: "Run a SQL query against this dataset's records.",
                      url: rwQueryUrl,
                  },
              ]
            : []),
    ];

    const copyEndpoint = async (url: string) => {
        await navigator.clipboard.writeText(url);
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: getThemedSpacing(500),
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: getThemedSpacing(200),
                }}
            >
                <h1
                    style={{
                        fontSize: getThemedFontSize(700),
                        fontWeight: 700,
                        color: getThemedColor('neutral', 900),
                    }}
                >
                    Select endpoints
                </h1>
                <p
                    style={{
                        fontSize: getThemedFontSize(400),
                        color: getThemedColor('neutral', 800),
                    }}
                >
                    Choose one or more API end points to connect to.
                </p>
            </div>

            {endpoints.map((endpoint, index) => {
                const isExpanded = expandedByIndex[index] ?? false;
                const selectedTab = selectedTabByIndex[index] ?? 'javascript';
                const snippetsByTab: Record<CodeTab, string> = {
                    javascript: getJsSnippet(endpoint.url),
                    python: getPythonSnippet(endpoint.url),
                    r: getRSnippet(endpoint.url),
                };

                return (
                    <div
                        key={endpoint.url}
                        style={{
                            border: `1px solid ${getThemedColor('neutral', 300)}`,
                            borderRadius: getThemedRadius(300),
                            padding: getThemedSpacing(400),
                            display: 'flex',
                            flexDirection: 'column',
                            gap: getThemedSpacing(400),
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: getThemedSpacing(400),
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: getThemedSpacing(200),
                                        marginBottom: getThemedSpacing(100),
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: getThemedFontSize(200),
                                            fontWeight: 700,
                                            color: getThemedColor('secondary', 900),
                                            background: getThemedColor('secondary', 200),
                                            borderRadius: getThemedRadius(100),
                                            padding: `2px ${getThemedSpacing(100)}`,
                                        }}
                                    >
                                        GET
                                    </span>
                                    <span
                                        style={{
                                            fontSize: getThemedFontSize(500),
                                            fontWeight: 700,
                                            color: getThemedColor('neutral', 800),
                                        }}
                                    >
                                        {endpoint.title}
                                    </span>
                                </div>
                                <p
                                    style={{
                                        fontSize: getThemedFontSize(400),
                                        color: getThemedColor('neutral', 800),
                                        marginBottom: getThemedSpacing(300),
                                    }}
                                >
                                    {endpoint.description}
                                </p>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: getThemedSpacing(300),
                                        fontSize: getThemedFontSize(300),
                                        color: getThemedColor('neutral', 700),
                                    }}
                                >
                                    <span>Created: {formatDate(dataset.metadata_modified)}</span>
                                    <span>
                                        Last updated: {formatDate(dataset.metadata_modified)}
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                size="default"
                                rightIcon={<ChevronDownIcon />}
                                onClick={() =>
                                    setExpandedByIndex((current) => ({
                                        ...current,
                                        [index]: !isExpanded,
                                    }))
                                }
                            >
                                {isExpanded ? 'Hide endpoint' : 'Show endpoint'}
                            </Button>
                        </div>

                        {isExpanded && (
                            <>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: getThemedSpacing(200),
                                    }}
                                >
                                    <div
                                        style={{
                                            flex: 1,
                                            border: `1px solid ${getThemedColor('neutral', 300)}`,
                                            borderRadius: getThemedRadius(200),
                                            background: getThemedColor('neutral', 100),
                                            padding: `${getThemedSpacing(200)} ${getThemedSpacing(300)}`,
                                            fontSize: getThemedFontSize(400),
                                            color: getThemedColor('neutral', 600),
                                            overflow: 'hidden',
                                            whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {endpoint.url}
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="default"
                                        leftIcon={<ClipboardDocumentIcon />}
                                        onClick={() => copyEndpoint(endpoint.url)}
                                    >
                                        Copy
                                    </Button>
                                </div>

                                <div>
                                    <TabBar
                                        variant="transparent"
                                        tabs={[
                                            { label: 'Javascript', value: 'javascript' },
                                            { label: 'Python', value: 'python' },
                                            { label: 'R', value: 'r' },
                                        ]}
                                        onTabClick={(value) =>
                                            setSelectedTabByIndex((current) => ({
                                                ...current,
                                                [index]: value as CodeTab,
                                            }))
                                        }
                                    />

                                    <div
                                        style={{
                                            background: getThemedColor('neutral', 200),
                                            borderRadius: getThemedRadius(300),
                                            padding: getThemedSpacing(400),
                                            fontSize: getThemedFontSize(400),
                                            color: getThemedColor('neutral', 800),
                                            lineHeight: '1.55',
                                            whiteSpace: 'pre-wrap',
                                            marginBottom: getThemedSpacing(400),
                                        }}
                                    >
                                        {snippetsByTab[selectedTab]}
                                    </div>

                                    <div style={{ display: 'flex', gap: getThemedSpacing(200) }}>
                                        <Button
                                            variant="secondary"
                                            size="default"
                                            rightIcon={<ArrowTopRightOnSquareIcon />}
                                            onClick={() =>
                                                window.open(
                                                    'https://docs.ckan.org/en/2.10/api/index.html',
                                                    '_blank'
                                                )
                                            }
                                        >
                                            CKAN auth docs
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="default"
                                            rightIcon={<ArrowTopRightOnSquareIcon />}
                                            onClick={() =>
                                                window.open(
                                                    'http://localhost:3000/user-guide#Where-to-find-metadata',
                                                    '_blank'
                                                )
                                            }
                                        >
                                            Datastore API docs
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );
            })}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="secondary" size="default" onClick={onBack}>
                    Back
                </Button>
                <Button variant="primary" size="default" onClick={onClose}>
                    Close
                </Button>
            </div>
        </div>
    );
}

export default SelectEndpoints;
