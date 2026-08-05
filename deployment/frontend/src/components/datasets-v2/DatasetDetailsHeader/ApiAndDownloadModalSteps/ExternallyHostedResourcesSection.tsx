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
import { formatFileSize } from '../download-utils';

type ExternallyHostedResourcesSectionProps = {
    resources: Resource[];
};

function ExternallyHostedResourcesSection({ resources }: ExternallyHostedResourcesSectionProps) {
    const getExternalResourcePath = (resource: Resource) => {
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
                {'Files hosted online'}
            </h3>

            {resources.map((resource) => (
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
                                {resource.title ?? resource.name ?? 'Selected file'}
                            </span>
                            <Tag label="Hosted Externally" variant="success" />
                        </div>
                        <div
                            style={{
                                fontSize: getThemedFontSize(400),
                                fontWeight: 700,
                                color: getThemedColor('neutral', 900),
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {formatFileSize(Number(resource.size ?? 0))}
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
                        <div style={{ flex: 1 }} title={resource.url}>
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
                                if (resource.url) {
                                    void navigator.clipboard.writeText(resource.url);
                                }
                            }}
                        >
                            Copy
                        </Button>

                        <Button
                            variant="secondary"
                            leftIcon={<ArrowTopRightOnSquareIcon width={16} height={16} />}
                            onClick={() => {
                                if (resource.url) {
                                    window.open(resource.url, '_blank', 'noopener,noreferrer');
                                }
                            }}
                        >
                            Open
                        </Button>
                    </div>

                    <InlineMessage
                        variant="warning"
                        size="full-width"
                        label="This file is hosted externally"
                        caption={
                            <span>
                                This resource is hosted outside Data Explorer and must be accessed
                                separately to your download. External repositories may require
                                additional permissions.
                            </span>
                        }
                    />
                </div>
            ))}
        </div>
    );
}

export default ExternallyHostedResourcesSection;
