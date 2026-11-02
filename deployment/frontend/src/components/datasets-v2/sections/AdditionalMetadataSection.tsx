import {
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import Link from 'next/link';
import { type WriDataset } from '@/schema/ckan.schema';
import { hasValue, toDisplay, unique } from '../utils/text';

type SearchFilter = {
    title: string;
    key: string;
    label: string;
    value: string;
};

function searchHref(filters: SearchFilter[]) {
    return {
        pathname: '/search',
        query: { search: JSON.stringify(filters) },
    };
}

const languageLabels: Record<string, string> = {
    en: 'English',
    fr: 'French',
    pt: 'Portuguese',
};

type MetadataItem = {
    label: string;
    value: string;
};

type Props = {
    dataset: WriDataset;
    cmsContentClassName: string;
};

function getAuthorNames(dataset: WriDataset): string[] {
    const authorEntries = [
        ...(dataset.authors ?? []).map((author) => ({
            name: author.name,
            email: author.email,
        })),
        ...(dataset.author || dataset.author_email
            ? [
                  {
                      name: dataset.author,
                      email: dataset.author_email,
                  },
              ]
            : []),
    ].filter((entry) => hasValue(entry.name) || hasValue(entry.email));

    return authorEntries
        .map((entry) => entry.name)
        .filter((name): name is string => hasValue(name));
}

function getAdditionalMetadataItems(dataset: WriDataset): MetadataItem[] {
    return [
        { label: 'Project', value: dataset.project },
        {
            label: 'Update frequency',
            value: dataset.update_frequency?.replace(/_/g, ' '),
        },
        {
            label: 'Language',
            value: dataset.language
                ? (languageLabels[dataset.language] ?? dataset.language)
                : undefined,
        },
        { label: 'Spatial address', value: dataset.spatial_address },
        { label: 'Provider', value: dataset.provider },
        { label: 'Connector type', value: dataset.connectorType },
        { label: 'Table name', value: dataset.tableName },
    ].filter((item): item is MetadataItem => hasValue(item.value));
}

export function hasAdditionalMetadata(dataset: WriDataset): boolean {
    const additionalMetadataItems = getAdditionalMetadataItems(dataset);
    const topicCount = (dataset.groups ?? []).filter((group) => group.type === 'group').length;
    const applicationCount =
        (dataset.applications ?? []).length +
        (dataset.groups ?? []).filter((group) => group.type === 'application').length;
    const keywordCount = (dataset.tags ?? []).length;
    const authorNames = getAuthorNames(dataset);

    return (
        additionalMetadataItems.length > 0 ||
        topicCount > 0 ||
        applicationCount > 0 ||
        keywordCount > 0 ||
        authorNames.length > 0
    );
}

function MetadataRow({
    label,
    values,
    links,
}: {
    label: string;
    values: string[];
    links?: Array<{ label: string; href: ReturnType<typeof searchHref> }>;
}) {
    if (!values.length) {
        return null;
    }

    return (
        <div
            style={{
                display: 'flex',
                gap: getThemedSpacing(200),
                alignItems: 'flex-start',
                padding: `${getThemedSpacing(100)} 0`,
            }}
        >
            <p
                style={{
                    color: getThemedColor('neutral', 700),
                    fontSize: getThemedFontSize(400),
                    lineHeight: '24px',
                    width: '150px',
                    flexShrink: 0,
                }}
            >
                {label}
            </p>
            <p
                style={{
                    color: getThemedColor('secondary', 800),
                    fontSize: getThemedFontSize(400),
                    lineHeight: '24px',
                    textDecorationLine: 'underline',
                    textDecorationStyle: 'dotted',
                }}
            >
                {links
                    ? links.map((link, index) => (
                          <span key={link.label}>
                              {index > 0 && ', '}
                              <Link href={link.href}>{link.label}</Link>
                          </span>
                      ))
                    : values.join(', ')}
            </p>
        </div>
    );
}

export default function AdditionalMetadataSection({ dataset }: Props) {
    const authorNames = getAuthorNames(dataset);
    const additionalMetadataItems = getAdditionalMetadataItems(dataset);

    const topicNames = unique(
        (dataset.groups ?? [])
            .filter((group) => group.type === 'group')
            .map((group) => toDisplay(group.display_name ?? group.title ?? group.name))
    );

    const applicationNames = unique([
        ...((dataset.applications ?? []).map((app) =>
            toDisplay(app.display_name ?? app.title ?? app.name)
        ) ?? []),
        ...((dataset.groups ?? [])
            .filter((group) => group.type === 'application')
            .map((group) => toDisplay(group.display_name ?? group.title ?? group.name)) ?? []),
    ]);

    const keywordEntries = unique((dataset.tags ?? []).map((tag) => tag.name)).map((tagName) => {
        const tag = (dataset.tags ?? []).find((t) => t.name === tagName);

        return {
            label: toDisplay(tag?.display_name ?? tagName) ?? tagName,
            value: tagName,
        };
    });

    const authorEntries = unique(authorNames).map((name) => ({
        label: toDisplay(name) ?? name,
        value: name,
    }));

    const metadataRows: Array<{
        label: string;
        values: string[];
        links?: Array<{ label: string; href: ReturnType<typeof searchHref> }>;
    }> = [
        { label: 'Topic(s):', values: topicNames },
        { label: 'Application:', values: applicationNames },
        {
            label: 'Keywords:',
            values: keywordEntries.map((entry) => entry.label),
            links: keywordEntries.map((entry) => ({
                label: entry.label,
                href: searchHref([
                    {
                        title: 'Tags',
                        key: 'tags',
                        label: entry.label,
                        value: entry.value,
                    },
                ]),
            })),
        },
        {
            label: 'Authors:',
            values: authorEntries.map((entry) => entry.label),
            links: authorEntries.map((entry) => ({
                label: entry.label,
                href: searchHref([
                    {
                        title: 'Search',
                        key: 'search',
                        label: entry.value,
                        value: entry.value,
                    },
                ]),
            })),
        },
        ...additionalMetadataItems.map((item) => ({
            label: `${item.label}:`,
            values: [item.value],
        })),
    ];

    return (
        <section id="additional-metadata" style={{ marginBottom: getThemedSpacing(1200) }}>
            <h2
                style={{
                    fontSize: getThemedFontSize(700),
                    fontWeight: 700,
                    paddingBottom: getThemedSpacing(300),
                }}
            >
                Additional metadata
            </h2>

            <div>
                {metadataRows.map((row) => (
                    <MetadataRow
                        key={row.label}
                        label={row.label}
                        values={row.values}
                        links={row.links}
                    />
                ))}
            </div>
        </section>
    );
}
