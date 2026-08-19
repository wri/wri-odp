import {
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { type WriDataset } from '@/schema/ckan.schema';
import { hasValue, stripCmsTypography, toDisplay, unique } from '../utils/text';

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
            label: 'Dataset type',
            value: dataset.dataset_type_info?.replace(/_/g, ' '),
        },
        {
            label: 'Update frequency',
            value: dataset.update_frequency?.replace(/_/g, ' '),
        },
        { label: 'Visibility', value: dataset.visibility_type },
        { label: 'Language', value: dataset.language },
        { label: 'Spatial type', value: dataset.spatial_type },
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
        hasValue(dataset.restrictions) ||
        topicCount > 0 ||
        applicationCount > 0 ||
        keywordCount > 0 ||
        authorNames.length > 0
    );
}

function MetadataRow({ label, values }: { label: string; values: string[] }) {
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
                {values.join(', ')}
            </p>
        </div>
    );
}

export default function AdditionalMetadataSection({ dataset, cmsContentClassName }: Props) {
    const authorNames = getAuthorNames(dataset);
    const additionalMetadataItems = getAdditionalMetadataItems(dataset);
    const restrictionsHtml = stripCmsTypography(dataset.restrictions ?? '');

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

    const keywordNames = unique(
        (dataset.tags ?? []).map((tag) => toDisplay(tag.display_name ?? tag.name))
    );

    const metadataRows: Array<{ label: string; values: string[] }> = [
        { label: 'Topic(s):', values: topicNames },
        { label: 'Application:', values: applicationNames },
        { label: 'Keywords:', values: keywordNames },
        { label: 'Authors:', values: unique(authorNames.map((name) => toDisplay(name))) },
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
                    <MetadataRow key={row.label} label={row.label} values={row.values} />
                ))}
            </div>

            {hasValue(restrictionsHtml) && (
                <>
                    <h3 className="font-semibold pt-4">Restrictions</h3>
                    <div
                        className={cmsContentClassName}
                        style={{
                            fontFamily: 'inherit',
                            fontSize: 'inherit',
                            lineHeight: 'inherit',
                        }}
                        dangerouslySetInnerHTML={{
                            __html: restrictionsHtml,
                        }}
                    ></div>
                </>
            )}
        </section>
    );
}
