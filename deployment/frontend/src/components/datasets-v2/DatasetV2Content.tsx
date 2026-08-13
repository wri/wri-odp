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
import CitationSection from './sections/CitationSection';
import MethodologySection from './sections/MethodologySection';
import ContactDetailsSection from './sections/ContactDetailsSection';
import AdditionalMetadataSection from './sections/AdditionalMetadataSection';
import { hasValue } from './utils/text';

type Props = {
    dataset: WriDataset;
};

const proseClassName =
    'prose max-w-none prose-a:text-wri-green prose-pre:bg-pre-code prose-pre:text-black prose-pre:text-base';
const cmsContentClassName = `${proseClassName} dataset-v2-cms-content`;

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
                    return (
                        Boolean(property) && property !== 'font' && !property.startsWith('font-')
                    );
                })
                .join('; ');

            return cleanedStyle ? ` style=${quote}${cleanedStyle}${quote}` : '';
        });
}

function getSafeExternalUrl(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    if (!trimmed) {
        return null;
    }

    try {
        if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
            return trimmed;
        }

        const parsedUrl = new URL(trimmed);
        if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
            return trimmed;
        }
    } catch {
        return null;
    }

    return null;
}

export default function DatasetV2Content({ dataset }: Props) {
    console.log(dataset);
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
        const extra = dataset.extras.find((item) =>
            normalizedKeys.includes(item.key.toLowerCase())
        );

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
    const safeLearnMoreUrl = getSafeExternalUrl(dataset.learn_more);

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

    const additionalMetadataItems: Array<{ label: string; value: string }> = [
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
    ].filter((item): item is { label: string; value: string } => hasValue(item.value));

    const topicCount = (dataset.groups ?? []).filter((group) => group.type === 'group').length;
    const applicationCount =
        (dataset.applications ?? []).length +
        (dataset.groups ?? []).filter((group) => group.type === 'application').length;
    const keywordCount = (dataset.tags ?? []).length;
    const authorNames = authorEntries
        .map((entry) => entry.name)
        .filter((name): name is string => hasValue(name));

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
    const hasAdditionalMetadata =
        additionalMetadataItems.length > 0 ||
        hasValue(restrictionsHtml) ||
        topicCount > 0 ||
        applicationCount > 0 ||
        keywordCount > 0 ||
        authorNames.length > 0;

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
                                actionLabel={safeLearnMoreUrl ? 'Read more' : undefined}
                                onActionClick={
                                    safeLearnMoreUrl
                                        ? () => {
                                              window.open(safeLearnMoreUrl, '_blank', 'noopener,noreferrer');
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
                                <CitationSection
                                    citationHtml={citationContentHtml}
                                    citationText={stripHtmlToText(citationHtml)}
                                    cmsContentClassName={cmsContentClassName}
                                />
                            )}

                            {hasMethodology && (
                                <MethodologySection
                                    methodologyHtml={methodologyContentHtml}
                                    useCasesHtml={useCasesContentHtml}
                                    functionHtml={functionContentHtml}
                                    technicalNotesUrl={dataset.technical_notes}
                                    cmsContentClassName={cmsContentClassName}
                                />
                            )}

                            {hasContactDetails && (
                                <ContactDetailsSection
                                    authors={authorEntries}
                                    maintainers={maintainerEntries}
                                />
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
                                <AdditionalMetadataSection
                                    dataset={dataset}
                                    authorNames={authorNames}
                                    additionalMetadataItems={additionalMetadataItems}
                                    restrictionsHtml={restrictionsContentHtml}
                                    cmsContentClassName={cmsContentClassName}
                                />
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
