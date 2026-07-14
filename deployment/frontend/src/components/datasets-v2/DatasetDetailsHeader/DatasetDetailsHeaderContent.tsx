import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
    Menu,
} from '@worldresources/wri-design-systems';
import { ArrowDownTrayIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import type { DatasetDetailsHeaderContentProps } from './types';

export default function DatasetDetailsHeaderContent({
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
                style={{
                    display: 'flex',
                    gap: getThemedSpacing(400),
                    marginTop: getThemedSpacing(400),
                }}
            >
                <Button variant="primary" size="default" leftIcon={<ArrowDownTrayIcon />}>
                    Download
                </Button>

                <Button variant="secondary" size="default" leftIcon={<GlobeAltIcon />}>
                    Access API
                </Button>

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
        </div>
    );
}
