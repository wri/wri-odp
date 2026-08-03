import { Squares2X2Icon } from '@heroicons/react/24/solid';
import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedRadius,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { formatFileSize } from '../download-utils';

type SelectFilesMapSelectionBarProps = {
    selectedCount: number;
    totalCount: number;
    selectedTotalBytes: number;
    onSelectAll: () => void;
    onClearAll: () => void;
};

export default function SelectFilesMapSelectionBar({
    selectedCount,
    totalCount,
    selectedTotalBytes,
    onSelectAll,
    onClearAll,
}: SelectFilesMapSelectionBarProps) {
    return (
        <div
            style={{
                position: 'absolute',
                left: getThemedSpacing(300),
                right: getThemedSpacing(300),
                bottom: getThemedSpacing(300),
                zIndex: 2,
                background: getThemedColor('neutral', 100),
                border: `1px solid ${getThemedColor('neutral', 300)}`,
                borderRadius: getThemedRadius(200),
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: getThemedSpacing(400),
                padding: `${getThemedSpacing(200)} ${getThemedSpacing(300)}`,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: getThemedSpacing(200),
                    minWidth: 0,
                }}
            >
                <Squares2X2Icon width={18} height={18} color={getThemedColor('neutral', 900)} />
                <span
                    style={{
                        fontSize: getThemedFontSize(400),
                        fontWeight: 700,
                        color: getThemedColor('neutral', 900),
                        whiteSpace: 'nowrap',
                    }}
                >
                    {selectedCount > 0
                        ? `${selectedCount}/${totalCount} tiles selected`
                        : 'No tiles selected'}
                </span>
                <Button variant="secondary" size="default" onClick={onSelectAll}>
                    Select all
                </Button>
                {selectedCount > 0 && (
                    <Button variant="secondary" size="default" onClick={onClearAll}>
                        Clear all
                    </Button>
                )}
            </div>

            <div
                style={{
                    fontSize: getThemedFontSize(400),
                    fontWeight: 700,
                    color: selectedCount > 0 ? getThemedColor('neutral', 900) : '#B91C1C',
                    whiteSpace: 'nowrap',
                }}
            >
                {selectedCount > 0
                    ? `Estimated size: ${formatFileSize(selectedTotalBytes)}`
                    : 'Select at least one tile to download'}
            </div>
        </div>
    );
}
