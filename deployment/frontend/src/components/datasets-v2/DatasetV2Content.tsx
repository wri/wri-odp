'use client';

import { useEffect, useRef, useState } from 'react';
import { getThemedFontSize, getThemedSpacing } from '@worldresources/wri-design-systems';
import DatasetTable from './DatasetTable';
import CautionInlineMessage from './CautionInlineMessage';
import { type WriDataset } from '@/schema/ckan.schema';
import Navigation from './Navigation';
import DatasetV2Map from './DatasetMap';
import DatasetDetailsHeader from './DatasetDetailsHeader';
import { constrainedHeaderContainerClassName } from './DatasetDetailsHeader/DatasetDetailsHeaderContent';
import { stripHtmlToText } from '@/utils/datasetJsonLd';
import CitationSection from './sections/CitationSection';
import MethodologySection from './sections/MethodologySection';
import ContactDetailsSection, {
    hasContactDetails as hasContactDetailsFromSection,
} from './sections/ContactDetailsSection';
import AdditionalReadingSection, {
    getAdditionalReadingLinks,
    hasAdditionalReading,
} from './sections/AdditionalReadingSection';
import AdditionalMetadataSection, {
    hasAdditionalMetadata,
} from './sections/AdditionalMetadataSection';
import RelatedDatasetsSection, { hasDatasetKeywords } from './sections/RelatedDatasetsSection';
import { hasValue, stripCmsTypography } from './utils/text';
import { getDatasetLicense } from '@/utils/datasetLicenses';
import ExclamationTriangleIcon from '@heroicons/react/24/solid/ExclamationTriangleIcon';

type Props = {
    dataset: WriDataset;
    diffFields?: string[];
};

const HIGHLIGHT = 'bg-yellow-200 outline outline-4 -outline-offset-4 outline-yellow-300';

// Mirrors the condensed header offset logic in `DatasetDetailsHeaderSticky`:
// the design system navbar publishes its height through this custom property
// (48px, or 96px while its links wrap), and only fires on resize, so a fallback
// is needed for the first paint.
const DATASET_V2_NAVBAR_HEIGHT_CSS_VAR = '--dataset-v2-navbar-height';
const DATASET_V2_NAVBAR_HEIGHT_FALLBACK = 48;

function readNavbarHeight() {
    if (typeof window === 'undefined') {
        return DATASET_V2_NAVBAR_HEIGHT_FALLBACK;
    }

    const raw = getComputedStyle(document.documentElement).getPropertyValue(
        DATASET_V2_NAVBAR_HEIGHT_CSS_VAR
    );
    const parsed = Number.parseFloat(raw);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : DATASET_V2_NAVBAR_HEIGHT_FALLBACK;
}

// Applied to the page content below the header when there is no map, so it lines
// up with the constrained header content.
const pageContentContainerClassName = constrainedHeaderContainerClassName;

export const proseClassName =
    'prose max-w-none prose-a:text-wri-green prose-pre:bg-pre-code prose-pre:text-black prose-pre:text-base';
export const cmsContentClassName = proseClassName;

export default function DatasetV2Content({ dataset, diffFields = [] }: Props) {
    const headerRef = useRef<HTMLDivElement>(null);
    const columnRef = useRef<HTMLElement>(null);
    const [columnBox, setColumnBox] = useState({ left: 0, width: 0 });
    const [navbarHeight, setNavbarHeight] = useState(DATASET_V2_NAVBAR_HEIGHT_FALLBACK);
    const [isHeaderSticky, setIsHeaderSticky] = useState(false);
    const [stickyHeaderHeight, setStickyHeaderHeight] = useState(0);
    // Mirror used inside the scroll handler so it never re-subscribes on state change.
    const isHeaderStickyRef = useRef(false);
    const stickyHeaderRef = useRef<HTMLDivElement>(null);

    // Keep in sync with the height the design system navbar reports through
    // `--dataset-v2-navbar-height` so both offsets below match the real navbar.
    useEffect(() => {
        const syncNavbarHeight = () => setNavbarHeight(readNavbarHeight());

        syncNavbarHeight();
        window.addEventListener('resize', syncNavbarHeight);

        return () => window.removeEventListener('resize', syncNavbarHeight);
    }, []);

    // The condensed header is a `fixed` overlay, so it has to be told where the page
    // column is: with a map the column is only part of the viewport width.
    useEffect(() => {
        const column = columnRef.current;

        if (!column) {
            return;
        }

        const measure = () => {
            const rect = column.getBoundingClientRect();
            setColumnBox({ left: rect.left, width: rect.width });
        };

        measure();

        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', measure);
            return () => window.removeEventListener('resize', measure);
        }

        const observer = new ResizeObserver(measure);
        observer.observe(column);
        window.addEventListener('resize', measure);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, []);

    // Measure the condensed header so the content below can be padded by its height
    // while it overlays the page.
    useEffect(() => {
        if (!isHeaderSticky) {
            return;
        }

        const measureSticky = () => {
            const height = stickyHeaderRef.current?.getBoundingClientRect().height ?? 0;
            setStickyHeaderHeight(height);
        };

        measureSticky();

        const observer = new ResizeObserver(measureSticky);
        if (stickyHeaderRef.current) {
            observer.observe(stickyHeaderRef.current);
        }

        return () => observer.disconnect();
    }, [isHeaderSticky]);

    // The expanded header is observed with a 30% visibility threshold: once 70% of it
    // has scrolled out of view it is removed from the flow and the condensed header
    // is rendered as a `fixed` overlay pinned below the navbar. The header height is
    // remembered so the collapse point stays stable while the header is hidden.
    useEffect(() => {
        const header = headerRef.current;

        if (!header) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry) {
                    return;
                }

                const shouldCollapse = !entry.isIntersecting;

                if (shouldCollapse === isHeaderStickyRef.current) {
                    return;
                }

                isHeaderStickyRef.current = shouldCollapse;
                setIsHeaderSticky(shouldCollapse);
            },
            {
                rootMargin: `-${navbarHeight}px 0px 0px 0px`,
                threshold: 0.3,
            }
        );

        observer.observe(header);

        return () => observer.disconnect();
    }, [navbarHeight]);

    // While collapsed the expanded header is hidden, so the observer above cannot
    // detect when it comes back into view; restore the original layout once the
    // user scrolls back to the top.
    useEffect(() => {
        const onScroll = () => {
            if (isHeaderStickyRef.current && window.scrollY <= 0) {
                isHeaderStickyRef.current = false;
                setIsHeaderSticky(false);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

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
                {/* The column spans the full page width so full-bleed blocks (like the
                    header background) can bleed edge to edge; the content itself is
                    constrained by pageContentContainerClassName below. */}
                <section ref={columnRef} className={layerRwId ? 'flex-1' : 'w-full'}>
                    {/* The expanded header is observed with a 30% threshold: once 70%
                        of it has scrolled out of view it is removed from the flow and
                        the condensed header takes over below the navbar. */}
                    <div
                        ref={headerRef}
                        className={hl('title', 'short_description', 'doi')}
                        style={isHeaderSticky ? { display: 'none' } : undefined}
                    >
                        <DatasetDetailsHeader
                            datasetTitle={datasetTitle}
                            datasetDescription={datasetDescription}
                            datasetName={datasetName}
                            dataset={dataset}
                            sectionItems={sectionItems}
                            hasMap={!!layerRwId}
                        />
                    </div>

                    {/* Condensed header: a fixed overlay pinned right below the navbar.
                        It is out of flow, so showing/hiding it never moves the page. */}
                    {isHeaderSticky && (
                        <div
                            ref={stickyHeaderRef}
                            style={{
                                position: 'fixed',
                                top: navbarHeight,
                                left: columnBox.left,
                                width: columnBox.width || undefined,
                                zIndex: 105,
                            }}
                        >
                            <DatasetDetailsHeader
                                datasetTitle={datasetTitle}
                                datasetDescription={datasetDescription}
                                datasetName={datasetName}
                                dataset={dataset}
                                sectionItems={sectionItems}
                                hasMap={!!layerRwId}
                                isSticky
                            />
                        </div>
                    )}

                    {/* Everything below the header keeps the constrained width. */}
                    <div
                        className={pageContentContainerClassName}
                        style={
                            isHeaderSticky && stickyHeaderHeight > 0
                                ? { paddingTop: stickyHeaderHeight }
                                : undefined
                        }
                    >
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
                                    <CautionInlineMessage
                                        text={cautionsText}
                                        icon={<ExclamationTriangleIcon width={18} height={18} />}
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
                                    <div
                                        className={hl('additional_reading', 'learn_more', 'extras')}
                                    >
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
                                    <div
                                        className={hl('methodology', 'usecases', 'technical_notes')}
                                    >
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
                                        <AdditionalMetadataSection
                                            dataset={dataset}
                                            cmsContentClassName={cmsContentClassName}
                                        />
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
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
