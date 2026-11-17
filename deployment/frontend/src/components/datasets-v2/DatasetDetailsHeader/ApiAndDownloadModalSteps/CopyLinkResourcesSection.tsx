import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedRadius,
    getThemedSpacing,
    InlineMessage,
    Tag,
    TextInput,
} from '@worldresources/wri-design-systems';
import { ArrowTopRightOnSquareIcon, ClipboardDocumentIcon } from '@heroicons/react/24/solid';
import { type Resource } from '@/interfaces/dataset.interface';
import {
    formatFileSize,
    getCopyLinkValue,
    getResourceFormatLabel,
    isGeeAssetResource,
} from '../download-utils';

type CopyLinkResourcesSectionProps = {
    resources: Resource[];
};

/**
 * Google Earth Engine assets and tile caches cannot be downloaded — users copy
 * the asset id / tile URL and consume it from their own tooling.
 */
function CopyLinkResourcesSection({ resources }: CopyLinkResourcesSectionProps) {
    if (resources.length === 0) {
        return null;
    }

    return (
        <div style={{ marginBottom: getThemedSpacing(600) }}>
            <h3
                style={{
                    fontSize: getThemedFontSize(600),
                    fontWeight: 700,
                    color: getThemedColor('neutral', 900),
                    marginBottom: getThemedSpacing(400),
                }}
            >
                {'Resources to copy'}
            </h3>

            {resources.map((resource) => {
                const value = getCopyLinkValue(resource);
                const isGee = isGeeAssetResource(resource);
                const label = isGee ? 'Asset ID' : 'Tile URL';

                return (
                    <div
                        key={`copy-${resource.id}`}
                        style={{
                            border: `1px solid ${getThemedColor('neutral', 300)}`,
                            borderRadius: getThemedRadius(200),
                            padding: getThemedSpacing(400),
                            marginBottom: getThemedSpacing(400),
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: getThemedSpacing(200),
                                marginBottom: getThemedSpacing(100),
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: getThemedSpacing(200),
                                    flexWrap: 'wrap',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: getThemedFontSize(500),
                                        fontWeight: 700,
                                        color: getThemedColor('neutral', 900),
                                    }}
                                >
                                    {resource.title ?? resource.name ?? 'Selected file'}
                                </span>
                                <Tag label={getResourceFormatLabel(resource)} variant="success" />
                            </div>
                            {resource.size ? (
                                <div
                                    style={{
                                        fontSize: getThemedFontSize(400),
                                        fontWeight: 700,
                                        color: getThemedColor('neutral', 900),
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {formatFileSize(Number(resource.size))}
                                </div>
                            ) : null}
                        </div>

                        <div
                            style={{
                                fontSize: getThemedFontSize(400),
                                color: getThemedColor('neutral', 800),
                                marginBottom: getThemedSpacing(300),
                            }}
                        >
                            {resource.description?.trim()
                                ? resource.description.trim()
                                : `${label} to use outside Data Explorer.`}
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                gap: getThemedSpacing(200),
                                marginBottom: getThemedSpacing(300),
                                alignItems: 'flex-end',
                            }}
                        >
                            <div style={{ flex: 1 }} title={value}>
                                <TextInput
                                    value={value}
                                    onChange={() => undefined}
                                    noMarginBottom
                                    disabled
                                />
                            </div>

                            <Button
                                variant="secondary"
                                leftIcon={<ClipboardDocumentIcon width={16} height={16} />}
                                onClick={() => {
                                    if (value) {
                                        void navigator.clipboard.writeText(value);
                                    }
                                }}
                            >
                                Copy
                            </Button>

                            {resource.url ? (
                                <Button
                                    variant="secondary"
                                    leftIcon={<ArrowTopRightOnSquareIcon width={16} height={16} />}
                                    onClick={() => {
                                        if (resource.url) {
                                            window.open(
                                                resource.url,
                                                '_blank',
                                                'noopener,noreferrer'
                                            );
                                        }
                                    }}
                                >
                                    Open
                                </Button>
                            ) : null}
                        </div>

                        <InlineMessage
                            variant="warning"
                            size="full-width"
                            label={
                                isGee
                                    ? 'This resource is not downloadable'
                                    : 'This tile cache is not downloadable'
                            }
                            caption={
                                <span>
                                    {isGee
                                        ? 'Copy the asset ID and use it in Google Earth Engine. It is not included in your download bundle.'
                                        : 'Copy the tile URL and consume the tiles from your own application. The tiles are not included in your download bundle.'}
                                </span>
                            }
                        />
                    </div>
                );
            })}
        </div>
    );
}

export default CopyLinkResourcesSection;
