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
import ContactDetailsSection, {
    hasContactDetails as hasContactDetailsFromSection,
} from './sections/ContactDetailsSection';
import AdditionalReadingSection, {
    getAdditionalReadingLinks,
    getPrimaryAdditionalReadingUrl,
    hasAdditionalReading,
} from './sections/AdditionalReadingSection';
import AdditionalMetadataSection, {
    hasAdditionalMetadata,
} from './sections/AdditionalMetadataSection';
import RelatedDatasetsSection, { hasDatasetKeywords } from './sections/RelatedDatasetsSection';
import { hasValue, stripCmsTypography } from './utils/text';
import { getDatasetLicense } from '@/utils/datasetLicenses';

type Props = {
    dataset: WriDataset;
    diffFields?: string[];
};

const HIGHLIGHT = 'bg-yellow-200 outline outline-4 -outline-offset-4 outline-yellow-300';

export const proseClassName =
    'prose max-w-none prose-a:text-wri-green prose-pre:bg-pre-code prose-pre:text-black prose-pre:text-base';
export const cmsContentClassName = proseClassName;

export default function DatasetV2Content({ dataset, diffFields = [] }: Props) {
    const hl = (...fields: string[]) =>
        diffFields.some((d) =>
            fields.some((f) => d === f || d.startsWith(`${f}[`) || d.startsWith(`${f}.`))
        )
            ? HIGHLIGHT
            : '';
    const datasetTitle = dataset.title ?? dataset.name;
    const datasetDescription = dataset.short_description ?? '';
    const datasetId = dataset.id;
    const datasetName = dataset.name;
    const licenseTitle = getDatasetLicense(dataset)?.title ?? '';
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
    const descriptionContentHtml = stripCmsTypography(descriptionHtml);
    const methodologyContentHtml = stripCmsTypography(methodologyHtml);
    const citationContentHtml = stripCmsTypography(citationHtml);
    const useCasesContentHtml = stripCmsTypography(useCasesHtml);
    const releaseNotesContentHtml = stripCmsTypography(releaseNotesHtml);
    const additionalReadingLinks = getAdditionalReadingLinks(dataset);
    const safeLearnMoreUrl = getPrimaryAdditionalReadingUrl(dataset);

    const cautionsText = stripHtmlToText(dataset.cautions);
    const relatedDatasets = getExtraValue([
        'related_datasets',
        'related datasets',
        'related-datasets',
    ]);
    const hasContactDetailsSection = hasContactDetailsFromSection(dataset);
    const hasDescription = hasValue(descriptionHtml);
    const hasAdditionalReadingSection = hasAdditionalReading(dataset);
    const hasCitation = hasValue(citationHtml);
    const hasMethodology =
        hasValue(methodologyHtml) || hasValue(useCasesHtml) || hasValue(dataset.technical_notes);
    const hasRelatedDatasets = hasDatasetKeywords(dataset) || hasValue(relatedDatasets);
    const hasReleaseNotes = hasValue(releaseNotesHtml);
    const hasAdditionalMetadataSection = hasAdditionalMetadata(dataset);

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
        ...(hasAdditionalReadingSection
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
        ...(hasContactDetailsSection
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
        ...(hasAdditionalMetadataSection
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
                    <div className={hl('title', 'short_description', 'doi')}>
                        <DatasetDetailsHeader
                            datasetTitle={datasetTitle}
                            datasetDescription={datasetDescription}
                            datasetName={datasetName}
                            dataset={dataset}
                            sectionItems={sectionItems}
                        />
                    </div>

                    <section
                        id="key-details"
                        className={hl(
                            'organization',
                            'owner_org',
                            'license_id',
                            'license_title',
                            'temporal_coverage_start',
                            'temporal_coverage_end',
                            'spatial_address',
                            'spatial',
                            'extras',
                            'dataset_format_info',
                            'dataset_type_info'
                        )}
                        style={{ scrollMarginTop: getThemedSpacing(700) }}
                    >
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
                            <div className={hl('cautions')}>
                                <InlineMessage
                                    size="full-width"
                                    variant="warning"
                                    label="Caution for using this dataset"
                                    caption={cautionsText}
                                    actionLabel={safeLearnMoreUrl ? 'Read more' : undefined}
                                    onActionClick={
                                        safeLearnMoreUrl
                                            ? () => {
                                                  window.open(
                                                      safeLearnMoreUrl,
                                                      '_blank',
                                                      'noopener,noreferrer'
                                                  );
                                              }
                                            : undefined
                                    }
                                />
                            </div>
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
                                <section id="description" className={hl('notes')}>
                                    <h2
                                        style={{
                                            fontSize: getThemedFontSize(700),
                                            fontWeight: 700,
                                            paddingBottom: getThemedSpacing(300),
                                        }}
                                    >
                                        Description
                                    </h2>
                                    <div
                                        className={cmsContentClassName}
                                        style={{
                                            fontFamily: 'inherit',
                                            fontSize: 'inherit',
                                            lineHeight: 'inherit',
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: descriptionContentHtml,
                                        }}
                                    ></div>
                                </section>
                            )}

                            {hasAdditionalReadingSection && (
                                <div className={hl('additional_reading', 'learn_more', 'extras')}>
                                    <AdditionalReadingSection links={additionalReadingLinks} />
                                </div>
                            )}

                            {hasCitation && (
                                <div className={hl('citation')}>
                                    <CitationSection
                                        citationHtml={citationContentHtml}
                                        citationText={stripHtmlToText(citationHtml)}
                                        cmsContentClassName={cmsContentClassName}
                                    />
                                </div>
                            )}

                            {hasMethodology && (
                                <div className={hl('methodology', 'usecases', 'technical_notes')}>
                                    <MethodologySection
                                        methodologyHtml={methodologyContentHtml}
                                        useCasesHtml={useCasesContentHtml}
                                        technicalNotesUrl={dataset.technical_notes}
                                        cmsContentClassName={cmsContentClassName}
                                    />
                                </div>
                            )}

                            {hasContactDetailsSection && (
                                <div
                                    className={hl(
                                        'author',
                                        'author_email',
                                        'authors',
                                        'maintainer',
                                        'maintainer_email',
                                        'maintainers'
                                    )}
                                >
                                    <ContactDetailsSection dataset={dataset} />
                                </div>
                            )}

                            {hasRelatedDatasets && (
                                <div className={hl('tags')}>
                                    <RelatedDatasetsSection dataset={dataset} />
                                </div>
                            )}

                            {hasReleaseNotes && (
                                <section id="release-notes" className={hl('release_notes')}>
                                    <h2
                                        style={{
                                            fontSize: getThemedFontSize(700),
                                            fontWeight: 700,
                                            paddingBottom: getThemedSpacing(300),
                                        }}
                                    >
                                        Release notes
                                    </h2>
                                    <div
                                        className={cmsContentClassName}
                                        style={{
                                            fontFamily: 'inherit',
                                            fontSize: 'inherit',
                                            lineHeight: 'inherit',
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: releaseNotesContentHtml,
                                        }}
                                    ></div>
                                </section>
                            )}

                            {hasAdditionalMetadataSection && (
                                <div
                                    className={hl(
                                        'applications',
                                        'author',
                                        'authors',
                                        'connectorType',
                                        'groups',
                                        'language',
                                        'project',
                                        'provider',
                                        'spatial_address',
                                        'tableName',
                                        'tags',
                                        'update_frequency'
                                    )}
                                >
                                    <AdditionalMetadataSection dataset={dataset} />
                                </div>
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
        </>
    );
}
