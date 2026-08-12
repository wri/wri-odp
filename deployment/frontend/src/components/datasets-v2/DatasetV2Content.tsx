import {
    getThemedFontSize,
    getThemedSpacing,
    InlineMessage,
} from '@worldresources/wri-design-systems';
import DatasetTable from './DatasetTable';
import { type WriDataset } from '@/schema/ckan.schema';
import Navigation from './Navigation';
import DatasetV2Map from './DatasetMap';
import DatasetDetailsHeader from './DatasetDetailsHeader';
import { stripHtmlToText } from '@/utils/datasetJsonLd';

type Props = {
    dataset: WriDataset;
};

const proseClassName =
    'prose max-w-none prose-a:text-wri-green prose-pre:bg-pre-code prose-pre:text-black prose-pre:text-base';
const cmsContentClassName = `${proseClassName} dataset-v2-cms-content`;

function hasValue(value: string | null | undefined): value is string {
    return Boolean(value?.trim());
}

function parseRelatedDatasets(value: string | undefined): string[] {
    if (!value?.trim()) {
        return [];
    }

    try {
        const parsed = JSON.parse(value) as unknown;
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
    } catch {
        // Fallback to comma/new-line format when extras are not JSON.
    }

    return value
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function stripCmsTypography(html: string): string {
    if (!html.trim()) {
        return '';
    }

    return html
        .replace(/<font\b[^>]*>/gi, '')
        .replace(/<\/font>/gi, '')
        .replace(/<small\b[^>]*>/gi, '')
        .replace(/<\/small>/gi, '')
        .replace(/\sstyle=(['"])(.*?)\1/gi, (_, quote: string, styleValue: string) => {
            const cleanedStyle = styleValue
                .split(';')
                .map((rule) => rule.trim())
                .filter(Boolean)
                .filter((rule) => {
                    const property = (rule.split(':')[0] ?? '').trim().toLowerCase();
                    return Boolean(property) && property !== 'font' && !property.startsWith('font-');
                })
                .join('; ');

            return cleanedStyle ? ` style=${quote}${cleanedStyle}${quote}` : '';
        });
}

export default function DatasetV2Content({ dataset }: Props) {
    const datasetTitle = dataset.title ?? dataset.name;
    const datasetDescription = dataset.short_description ?? '';
    const datasetId = dataset.id;
    const datasetName = dataset.name;
    const licenseTitle = dataset.license_title ?? '';
    const layerResource = dataset.resources?.find(
        (resource: { format?: string; rw_id?: string | null }) =>
            resource?.format === 'Layer' || !!resource?.rw_id
    );
    const layerRwId = layerResource?.rw_id ?? null;

    const getExtraValue = (keys: string[]) => {
        if (!dataset.extras?.length) return undefined;

        const normalizedKeys = keys.map((k) => k.toLowerCase());
        const extra = dataset.extras.find((item) => normalizedKeys.includes(item.key.toLowerCase()));

        return extra?.value;
    };

    const methodologyHtml = dataset.methodology ?? '';
    const descriptionHtml = dataset.notes ?? '';
    const citationHtml = dataset.citation ?? '';
    const releaseNotesHtml = dataset.release_notes ?? '';
    const useCasesHtml = dataset.usecases ?? '';
    const functionHtml = dataset.function ?? '';
    const restrictionsHtml = dataset.restrictions ?? '';
    const descriptionContentHtml = stripCmsTypography(descriptionHtml);
    const methodologyContentHtml = stripCmsTypography(methodologyHtml);
    const citationContentHtml = stripCmsTypography(citationHtml);
    const useCasesContentHtml = stripCmsTypography(useCasesHtml);
    const functionContentHtml = stripCmsTypography(functionHtml);
    const releaseNotesContentHtml = stripCmsTypography(releaseNotesHtml);
    const restrictionsContentHtml = stripCmsTypography(restrictionsHtml);

    const cautionsText = stripHtmlToText(dataset.cautions);
    const relatedDatasets = parseRelatedDatasets(
        getExtraValue(['related_datasets', 'related datasets', 'related-datasets'])
    );

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

    const maintainerEntries = [
        ...(dataset.maintainers ?? []).map((maintainer) => ({
            name: maintainer.name,
            email: maintainer.email,
        })),
        ...(dataset.maintainer || dataset.maintainer_email
            ? [
                  {
                      name: dataset.maintainer,
                      email: dataset.maintainer_email,
                  },
              ]
            : []),
    ].filter((entry) => hasValue(entry.name) || hasValue(entry.email));

    const additionalMetadataItems = [
        { label: 'Project', value: dataset.project },
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
    ].filter((item) => hasValue(item.value));

    const hasContactDetails = authorEntries.length > 0 || maintainerEntries.length > 0;
    const hasDescription = hasValue(descriptionHtml);
    const hasAdditionalReading =
        hasValue(dataset.learn_more) || hasValue(dataset.technical_notes) || hasValue(dataset.url);
    const hasCitation = hasValue(citationHtml);
    const hasMethodology =
        hasValue(methodologyHtml) ||
        hasValue(useCasesHtml) ||
        hasValue(functionHtml) ||
        hasValue(dataset.technical_notes);
    const hasRelatedDatasets = relatedDatasets.length > 0;
    const hasReleaseNotes = hasValue(releaseNotesHtml);
    const hasAdditionalMetadata = additionalMetadataItems.length > 0 || hasValue(restrictionsHtml);

    const sectionItems = [
        {
            label: 'Key details',
            value: 'key-details',
        },
        ...(hasDescription
            ? [
                  {
                      label: 'Description',
                      value: 'description',
                  },
              ]
            : []),
        ...(hasAdditionalReading
            ? [
                  {
                      label: 'Additional Reading',
                      value: 'additional-reading',
                  },
              ]
            : []),
        ...(hasCitation
            ? [
                  {
                      label: 'Citation',
                      value: 'citation',
                  },
              ]
            : []),
        ...(hasMethodology
            ? [
                  {
                      label: 'Methodology',
                      value: 'methodology',
                  },
              ]
            : []),
        ...(hasContactDetails
            ? [
                  {
                      label: 'Contact details',
                      value: 'contact-details',
                  },
              ]
            : []),
        ...(hasRelatedDatasets
            ? [
                  {
                      label: 'Related datasets',
                      value: 'related-datasets',
                  },
              ]
            : []),
        ...(hasReleaseNotes
            ? [
                  {
                      label: 'Release notes',
                      value: 'release-notes',
                  },
              ]
            : []),
        ...(hasAdditionalMetadata
            ? [
                  {
                      label: 'Additional metadata',
                      value: 'additional-metadata',
                  },
              ]
            : []),
    ];

    return (
        <>
            <Navigation />
            <div className={layerRwId ? 'flex flex-col md:flex-row' : 'flex flex-col'}>
                <section className={layerRwId ? 'flex-1' : 'w-full'}>
                    <DatasetDetailsHeader
                        datasetTitle={datasetTitle}
                        datasetDescription={datasetDescription}
                        datasetName={datasetName}
                        dataset={dataset}
                        sectionItems={sectionItems}
                    />

                    <section id="key-details" style={{ scrollMarginTop: getThemedSpacing(700) }}>
                        <DatasetTable
                            datasetId={datasetId}
                            licenseTitle={licenseTitle}
                            dataset={dataset}
                        />
                    </section>

                    <section
                        style={{
                            padding: `0 ${getThemedSpacing(700)}`,
                        }}
                    >
                        {hasValue(cautionsText) && (
                            <InlineMessage
                                size="full-width"
                                variant="warning"
                                label="Caution for using this dataset"
                                caption={cautionsText}
                                actionLabel={hasValue(dataset.learn_more) ? 'Read more' : undefined}
                                onActionClick={
                                    hasValue(dataset.learn_more)
                                        ? () => {
                                              window.open(
                                                  dataset.learn_more,
                                                  '_blank',
                                                  'noopener,noreferrer'
                                              );
                                          }
                                        : undefined
                                }
                            />
                        )}

                        <div
                            style={{
                                gap: getThemedSpacing(1200),
                                display: 'flex',
                                flexDirection: 'column',
                                paddingTop: getThemedSpacing(1200),
                            }}
                        >
                            {hasDescription && (
                                <section id="description">
                                    <h2
                                        style={{
                                            fontSize: getThemedFontSize(700),
                                            fontWeight: 700,
                                        }}
                                    >
                                        Description
                                    </h2>
                                    <div
                                        className={cmsContentClassName}
                                        dangerouslySetInnerHTML={{
                                            __html: descriptionContentHtml,
                                        }}
                                    ></div>
                                </section>
                            )}

                            {hasAdditionalReading && (
                                <section id="additional-reading">
                                    <h2
                                        style={{
                                            fontSize: getThemedFontSize(700),
                                            fontWeight: 700,
                                        }}
                                    >
                                        Additional Reading
                                    </h2>

                                    <ul className="list-disc pl-5">
                                        {hasValue(dataset.learn_more) && (
                                            <li>
                                                <a
                                                    className="text-wri-green underline"
                                                    href={dataset.learn_more}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Learn more
                                                </a>
                                            </li>
                                        )}
                                        {hasValue(dataset.technical_notes) && (
                                            <li>
                                                <a
                                                    className="text-wri-green underline"
                                                    href={dataset.technical_notes}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Technical notes
                                                </a>
                                            </li>
                                        )}
                                        {hasValue(dataset.url) && (
                                            <li>
                                                <a
                                                    className="text-wri-green underline"
                                                    href={dataset.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Source
                                                </a>
                                            </li>
                                        )}
                                    </ul>
                                </section>
                            )}

                            {hasCitation && (
                                <section id="citation">
                                    <h2
                                        style={{
                                            fontSize: getThemedFontSize(700),
                                            fontWeight: 700,
                                        }}
                                    >
                                        Citation
                                    </h2>
                                    <div
                                        className={cmsContentClassName}
                                        dangerouslySetInnerHTML={{
                                            __html: citationContentHtml,
                                        }}
                                    ></div>
                                </section>
                            )}

                            {hasMethodology && (
                                <section id="methodology">
                                    <h2
                                        style={{
                                            fontSize: getThemedFontSize(700),
                                            fontWeight: 700,
                                        }}
                                    >
                                        Methodology
                                    </h2>

                                    {hasValue(dataset.technical_notes) && (
                                        <p>
                                            <a
                                                className="text-wri-green underline"
                                                href={dataset.technical_notes}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Technical notes
                                            </a>
                                        </p>
                                    )}

                                    {hasValue(methodologyHtml) && (
                                        <div
                                            className={cmsContentClassName}
                                            dangerouslySetInnerHTML={{ __html: methodologyContentHtml }}
                                        ></div>
                                    )}

                                    {hasValue(useCasesHtml) && (
                                        <>
                                            <h3 className="font-semibold">Use cases</h3>
                                            <div
                                                className={cmsContentClassName}
                                                dangerouslySetInnerHTML={{ __html: useCasesContentHtml }}
                                            ></div>
                                        </>
                                    )}

                                    {hasValue(functionHtml) && (
                                        <>
                                            <h3 className="font-semibold">Function</h3>
                                            <div
                                                className={cmsContentClassName}
                                                dangerouslySetInnerHTML={{ __html: functionContentHtml }}
                                            ></div>
                                        </>
                                    )}
                                </section>
                            )}

                            {hasContactDetails && (
                                <section id="contact-details">
                                    <h2
                                        style={{
                                            fontSize: getThemedFontSize(700),
                                            fontWeight: 700,
                                        }}
                                    >
                                        Contact details
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {authorEntries.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold">Authors</h3>
                                                <div className="space-y-3 pt-2">
                                                    {authorEntries.map((entry, index) => (
                                                        <div key={`author-${index}`}>
                                                            {hasValue(entry.name) && <p>{entry.name}</p>}
                                                            {hasValue(entry.email) && <p>{entry.email}</p>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {maintainerEntries.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold">Maintainers</h3>
                                                <div className="space-y-3 pt-2">
                                                    {maintainerEntries.map((entry, index) => (
                                                        <div key={`maintainer-${index}`}>
                                                            {hasValue(entry.name) && <p>{entry.name}</p>}
                                                            {hasValue(entry.email) && <p>{entry.email}</p>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {hasRelatedDatasets && (
                                <section id="related-datasets">
                                    <h2
                                        style={{
                                            fontSize: getThemedFontSize(700),
                                            fontWeight: 700,
                                        }}
                                    >
                                        Related datasets
                                    </h2>
                                    <ul className="list-disc pl-5">
                                        {relatedDatasets.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {hasReleaseNotes && (
                                <section id="release-notes">
                                    <h2
                                        style={{
                                            fontSize: getThemedFontSize(700),
                                            fontWeight: 700,
                                        }}
                                    >
                                        Release notes
                                    </h2>
                                    <div
                                        className={cmsContentClassName}
                                        dangerouslySetInnerHTML={{
                                            __html: releaseNotesContentHtml,
                                        }}
                                    ></div>
                                </section>
                            )}

                            {hasAdditionalMetadata && (
                                <section id="additional-metadata">
                                    <h2
                                        style={{
                                            fontSize: getThemedFontSize(700),
                                            fontWeight: 700,
                                        }}
                                    >
                                        Additional metadata
                                    </h2>

                                    {additionalMetadataItems.length > 0 && (
                                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                                            {additionalMetadataItems.map((item) => (
                                                <div key={item.label}>
                                                    <dt className="font-semibold">{item.label}</dt>
                                                    <dd>{item.value}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    )}

                                    {hasValue(restrictionsHtml) && (
                                        <>
                                            <h3 className="font-semibold pt-4">Restrictions</h3>
                                            <div
                                                className={cmsContentClassName}
                                                dangerouslySetInnerHTML={{ __html: restrictionsContentHtml }}
                                            ></div>
                                        </>
                                    )}
                                </section>
                            )}
                        </div>
                    </section>
                </section>
                {layerRwId ? (
                    <section
                        className="flex-1 md:sticky md:top-12 md:self-start md:h-[calc(100vh-48px)] overflow-hidden"
                        style={{ backgroundColor: 'lightgray' }}
                    >
                        <DatasetV2Map datasetId={datasetId} layerRwId={layerRwId} />
                    </section>
                ) : null}
            </div>

            <style jsx global>{`
                .dataset-v2-cms-content * {
                    font-family: inherit !important;
                    font-size: inherit !important;
                    line-height: inherit;
                }
            `}</style>
        </>
    );
}
