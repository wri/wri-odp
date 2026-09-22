import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
    Menu,
} from '@worldresources/wri-design-systems';
import { ChevronDownIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import type { DatasetDetailsHeaderContentProps } from './types';
import DatasetDownloadButton from './DatasetDownloadButton';
import AccessApiButton from './AccessApiButton';
import { formatDate } from './download-utils';

export default function DatasetDetailsHeaderContent({
    dataset,
    datasetTitle,
    datasetDescription,
    openInItems,
}: DatasetDetailsHeaderContentProps) {
    const hasSingleOpenInOption = openInItems.length === 1;
    const singleOpenInItem = hasSingleOpenInOption ? openInItems[0] : undefined;
    const openInTriggerLabel = hasSingleOpenInOption
        ? `Open in (${singleOpenInItem?.label ?? 'app'})`
        : 'Open in app';

    const onOpenInSelect = (value: string) => {
        window.open(value, '_blank', 'noopener,noreferrer');
    };

    return (
        <div
            className="font-acumin"
            style={{
                backgroundColor: getThemedColor('secondary', 100),
                padding: `${getThemedSpacing(800)} ${getThemedSpacing(600)} ${getThemedSpacing(900)} ${getThemedSpacing(600)}`,
                borderBottom: `1px solid ${getThemedColor('neutral', 300)}`,
            }}
        >
            <h1
                style={{
                    fontSize: getThemedFontSize(900),
                    color: getThemedColor('secondary', 900),
                    fontWeight: 700,
                }}
            >
                {datasetTitle}
            </h1>

            <p className="mt-4 text-lg text-stone-600">{datasetDescription ?? 'No description.'}</p>

            <div
                className="flex flex-col md:flex-row md:items-center"
                style={{
                    gap: getThemedSpacing(400),
                    marginTop: getThemedSpacing(400),
                }}
            >
                {dataset?.resources?.length > 0 && (
                    <DatasetDownloadButton dataset={dataset} size="default" />
                )}
                <AccessApiButton dataset={dataset} />

                {hasSingleOpenInOption && singleOpenInItem?.value ? (
                    <Button
                        variant="secondary"
                        size="default"
                        leftIcon={<ArrowTopRightOnSquareIcon />}
                        onClick={() => {
                            if (singleOpenInItem?.value) {
                                onOpenInSelect(singleOpenInItem.value);
                            }
                        }}
                    >
                        {openInTriggerLabel}
                    </Button>
                ) : openInItems.length > 0 ? (
                    <Menu
                        label="Open in"
                        items={openInItems}
                        onSelect={onOpenInSelect}
                        hideArrow
                        customTrigger={
                            <Button
                                variant="secondary"
                                size="default"
                                leftIcon={<ArrowTopRightOnSquareIcon />}
                                rightIcon={<ChevronDownIcon />}
                            >
                                {openInTriggerLabel}
                            </Button>
                        }
                    />
                ) : null}
            </div>

            <div
                className="flex flex-col md:flex-row md:items-center"
                style={{
                    gap: getThemedSpacing(400),
                    marginTop: getThemedSpacing(400),
                    fontSize: getThemedFontSize(300),
                    color: getThemedColor('neutral', 800),
                    lineHeight: getThemedSpacing(500),
                }}
            >
                {dataset?.metadata_created && (
                    <span>Created: {formatDate(dataset.metadata_created)}</span>
                )}
                {dataset?.metadata_modified && (
                    <span>Last updated: {formatDate(dataset.metadata_modified)}</span>
                )}
                {dataset?.doi && <span>DOI: {dataset.doi}</span>}
            </div>
        </div>
    );
}
