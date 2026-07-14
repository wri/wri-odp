import { useRef } from 'react';
import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
    Menu,
} from '@worldresources/wri-design-systems';
import { ArrowDownTrayIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import type { DatasetDetailsHeaderStickyProps } from './types';

const sectionItems = [
    {
        label: 'Key details',
        value: 'key-details',
    },
    {
        label: 'Description',
        value: 'description',
    },
    {
        label: 'Additional Reading',
        value: 'additional-reading',
    },
    {
        label: 'Citation',
        value: 'citation',
    },
    {
        label: 'Methodology',
        value: 'methodology',
    },
    {
        label: 'Contact details',
        value: 'contact-details',
    },
    {
        label: 'Related datasets',
        value: 'related-datasets',
    },

    {
        label: 'Release notes',
        value: 'release-notes',
    },
    {
        label: 'Additional metadata',
        value: 'additional-metadata',
    },
];

function DatasetDetailsHeaderSticky({
    datasetTitle,
    openInItems,
}: DatasetDetailsHeaderStickyProps) {
    const stickyHeaderRef = useRef<HTMLDivElement>(null);
    const stickyOpenInItems = openInItems.map((item) => ({
        label: `Open in (${item.label})`,
        value: item.value,
        endIcon: <ArrowTopRightOnSquareIcon />,
    }));

    const onOpenInSelect = (value: string) => {
        if (value === 'access-api') {
            console.log('Access API clicked');
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

    const onSectionSelect = (sectionId: string) => {
        const targetElement = document.getElementById(sectionId);

        if (!targetElement) {
            return;
        }

        const navbarHeight = Number.parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue(
                '--dataset-v2-navbar-height'
            )
        );
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
            className="sticky z-600 top-12 left-0 right-0 z-50 font-acumin"
            style={{
                backgroundColor: getThemedColor('neutral', 100),
                padding: `${getThemedSpacing(300)} ${getThemedSpacing(600)}`,
                borderBottom: `1px solid ${getThemedColor('neutral', 300)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
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

            <div
                style={{
                    display: 'flex',
                    gap: getThemedSpacing(400),
                }}
            >
                <Button variant="primary" size="small" leftIcon={<ArrowDownTrayIcon />}>
                    Download
                </Button>

                <Menu
                    label="Section"
                    items={sectionItems}
                    onSelect={onSectionSelect}
                    hideArrow
                    customTrigger={
                        <Button variant="secondary" size="small" rightIcon={<ChevronDownIcon />}>
                            <span style={{ fontSize: getThemedFontSize(200), fontWeight: 400 }}>
                                Section:
                            </span>
                            <span style={{ fontSize: getThemedFontSize(200), fontWeight: 700 }}>
                                Key details
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
    );
}

export default DatasetDetailsHeaderSticky;
