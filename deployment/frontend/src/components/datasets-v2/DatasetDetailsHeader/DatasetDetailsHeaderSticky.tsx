import { useEffect, useRef, useState } from 'react';
import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
    Menu,
} from '@worldresources/wri-design-systems';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { type WriDataset } from '@/schema/ckan.schema';
import DatasetDownloadButton from './DatasetDownloadButton';
import AccessApiButton from './AccessApiButton';
import { hasDownloadableResources } from './download-utils';
import type { DatasetDetailsHeaderMenuItem } from './types';
import { constrainedHeaderContainerClassName } from './DatasetDetailsHeaderContent';

type SectionItem = {
    label: string;
    value: string;
};

type Props = {
    dataset: WriDataset;
    datasetTitle: string;
    openInItems: DatasetDetailsHeaderMenuItem[];
    sectionItems: SectionItem[];
    hasMap?: boolean;
};

function DatasetDetailsHeaderSticky({
    dataset,
    datasetTitle,
    openInItems,
    sectionItems,
    hasMap = true,
}: Props) {
    const stickyHeaderRef = useRef<HTMLDivElement>(null);
    const [isAccessApiModalOpen, setIsAccessApiModalOpen] = useState(false);
    const [selectedSectionLabel, setSelectedSectionLabel] = useState(
        sectionItems[0]?.label ?? 'Section'
    );

    const stickyOpenInItems = openInItems.map((item) => ({
        label: `Open in (${item.label})`,
        value: item.value,
        endIcon: <ArrowTopRightOnSquareIcon />,
    }));

    const onOpenInSelect = (value: string) => {
        if (value === 'access-api') {
            setIsAccessApiModalOpen(true);
            return;
        }

        window.open(value, '_blank', 'noopener,noreferrer');
    };

    const openInItemsAndAccessApi = [
        {
            label: 'Access API',
            value: 'access-api',
        },
        ...stickyOpenInItems,
    ];

    useEffect(() => {
        if (!sectionItems.length) {
            setSelectedSectionLabel('Section');
            return;
        }

        const selectedStillExists = sectionItems.some(
            (item) => item.label === selectedSectionLabel
        );

        if (!selectedStillExists) {
            setSelectedSectionLabel(sectionItems[0]?.label ?? 'Section');
        }
    }, [sectionItems, selectedSectionLabel]);

    const onSectionSelect = (sectionId: string) => {
        const selectedSection = sectionItems.find((item) => item.value === sectionId);

        if (selectedSection?.label) {
            setSelectedSectionLabel(selectedSection.label);
        }

        const targetElement = document.getElementById(sectionId);

        if (!targetElement) {
            return;
        }

        const navbarHeightRaw = getComputedStyle(document.documentElement).getPropertyValue(
            '--dataset-v2-navbar-height'
        );
        const navbarHeightParsed = Number.parseFloat(navbarHeightRaw);
        const navbarHeight = Number.isFinite(navbarHeightParsed) ? navbarHeightParsed : 0;

        const stickyHeaderHeight = stickyHeaderRef.current?.getBoundingClientRect().height ?? 0;
        const offset = navbarHeight + stickyHeaderHeight;

        window.scrollTo({
            top: targetElement.getBoundingClientRect().top + window.scrollY - offset,
            behavior: 'smooth',
        });
    };

    return (
        <div
            ref={stickyHeaderRef}
            className="w-full font-acumin"
            style={{
                backgroundColor: getThemedColor('secondary', 100),
                padding: hasMap
                    ? `${getThemedSpacing(300)} ${getThemedSpacing(600)}`
                    : `${getThemedSpacing(300)} 0`,
                borderBottom: `1px solid ${getThemedColor('neutral', 300)}`,
            }}
        >
            <div
                className={hasMap ? 'w-full' : constrainedHeaderContainerClassName}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    ...(hasMap ? {} : { padding: `0 ${getThemedSpacing(700)}` }),
                }}
            >
                <h1
                    style={{
                        fontSize: getThemedFontSize(500),
                        color: getThemedColor('neutral', 800),
                        fontWeight: 700,
                    }}
                >
                    {datasetTitle}
                </h1>

                <div className="flex gap-1 sm:gap-4">
                    {dataset?.resources && hasDownloadableResources(dataset.resources) && (
                        <DatasetDownloadButton dataset={dataset} size="small" />
                    )}
                    <AccessApiButton
                        dataset={dataset}
                        hideButton
                        isAccessApiModalOpen={isAccessApiModalOpen}
                    />
                    <Menu
                        label="Section"
                        items={sectionItems}
                        onSelect={onSectionSelect}
                        hideArrow
                        customTrigger={
                            <Button
                                variant="secondary"
                                size="small"
                                rightIcon={<ChevronDownIcon />}
                            >
                                <span style={{ fontSize: getThemedFontSize(200), fontWeight: 400 }}>
                                    Section:
                                </span>
                                <span
                                    className="hidden sm:inline"
                                    style={{ fontSize: getThemedFontSize(200), fontWeight: 700 }}
                                >
                                    {selectedSectionLabel}
                                </span>
                            </Button>
                        }
                    />

                    {openInItemsAndAccessApi.length > 0 && (
                        <Menu
                            label="Open in"
                            items={openInItemsAndAccessApi}
                            onSelect={onOpenInSelect}
                            hideArrow
                            customTrigger={<EllipsisVerticalIcon height={24} />}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default DatasetDetailsHeaderSticky;
