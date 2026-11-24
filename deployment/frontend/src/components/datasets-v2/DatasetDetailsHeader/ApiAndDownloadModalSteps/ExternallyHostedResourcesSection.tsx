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
    getResourceSize,
    getResourceTitle,
    isCopyLinkResource,
    isGeeAssetResource,
    isTileCacheResource,
} from '../download-utils';

type ExternallyHostedResourcesSectionProps = {
    resources: Resource[];
};

function ExternallyHostedResourcesSection({ resources }: ExternallyHostedResourcesSectionProps) {
    const getExternalResourcePath = (resource: Resource) => {
        if (isCopyLinkResource(resource)) {
            return getCopyLinkValue(resource);
        }

        if (!resource.url) {
            return '';
        }

        try {
            const parsed = new URL(resource.url);
            return `${parsed.hostname}${parsed.pathname}`;
        } catch {
            return resource.url;
        }
    };

    /** Value the Copy button writes to the clipboard. */
    const getCopyValue = (resource: Resource) =>
        isCopyLinkResource(resource) ? getCopyLinkValue(resource) : (resource.url ?? '');

    /**
     * Only plain external links can be opened in the browser: GEE asset ids are
     * not URLs, and an external tile URL is meant to be consumed by the user's
     * own application, not opened as a page.
     */
    const getOpenValue = (resource: Resource) =>
        isCopyLinkResource(resource) ? '' : (resource.url ?? '');

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
                {'Resources hosted online'}
            </h3>

            {resources.map((resource) => {
                const isGee = isGeeAssetResource(resource);
                const isTileCache = isTileCacheResource(resource);
                const valueLabel = isGee ? 'Asset ID' : isTileCache ? 'Tile Cache Link' : 'Link';

                return (
                    <div
                        key={`external-${resource.id}`}
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
                                    {getResourceTitle(resource)}
                                </span>
                                <Tag label={getResourceFormatLabel(resource)} variant="success" />
                            </div>
                            <div
                                style={{
                                    fontSize: getThemedFontSize(400),
                                    fontWeight: 700,
                                    color: getThemedColor('neutral', 900),
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {formatFileSize(getResourceSize(resource))}
                            </div>
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
                                : isGee
                                  ? `${valueLabel} to use in Google Earth Engine.`
                                  : isTileCache
                                    ? `${valueLabel} to consume the tiles from your own application.`
                                    : 'This file is hosted externally and can be accessed separately.'}
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                gap: getThemedSpacing(200),
                                marginBottom: getThemedSpacing(300),
                                alignItems: 'flex-end',
                            }}
                        >
                            <div style={{ flex: 1 }} title={getCopyValue(resource)}>
                                <TextInput
                                    value={getExternalResourcePath(resource)}
                                    onChange={() => undefined}
                                    noMarginBottom
                                    disabled
                                />
                            </div>

                            <Button
                                variant="secondary"
                                leftIcon={<ClipboardDocumentIcon width={16} height={16} />}
                                onClick={() => {
                                    const value = getCopyValue(resource);
                                    if (value) {
                                        void navigator.clipboard.writeText(value);
                                    }
                                }}
                            >
                                Copy
                            </Button>

                            {getOpenValue(resource) ? (
                                <Button
                                    variant="secondary"
                                    leftIcon={<ArrowTopRightOnSquareIcon width={16} height={16} />}
                                    onClick={() => {
                                        const url = getOpenValue(resource);
                                        if (url) {
                                            window.open(url, '_blank', 'noopener,noreferrer');
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
                                    : isTileCache
                                      ? 'This tile cache is not downloadable'
                                      : 'This file is hosted externally'
                            }
                            caption={
                                <span>
                                    {isGee
                                        ? 'Copy the asset ID and use it in Google Earth Engine. It is not included in your download bundle.'
                                        : isTileCache
                                          ? 'Copy the tile URL and consume the tiles from your own application. The tiles are not included in your download bundle.'
                                          : 'This resource is hosted outside Data Explorer and must be accessed separately to your download. External repositories may require additional permission.'}
                                </span>
                            }
                        />
                    </div>
                );
            })}
        </div>
    );
}

export default ExternallyHostedResourcesSection;
