import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedRadius,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import {
    ChevronRightIcon,
    CodeBracketSquareIcon,
    ChatBubbleLeftEllipsisIcon,
    DocumentIcon,
    UserIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/solid';
import { type Resource } from '@/interfaces/dataset.interface';
import { useEffect } from 'react';
import DownloadStartedBanner from './DownloadStartedBanner';
import ExternallyHostedResourcesSection from './ExternallyHostedResourcesSection';
import FileCard from './FileCard';
import { formatDate, formatFileSize, getResourceFormatLabel } from '../download-utils';
import { useDirectDownload } from './useDirectDownload';

type ConfirmationStepProps = {
    selectedResources: Resource[];
    totalSelectedBytes: number;
    datasetName: string;
    onBack: () => void;
    onClose: () => void;
};

function ConfirmationStep({
    selectedResources,
    totalSelectedBytes: _totalSelectedBytes,
    datasetName,
    onBack,
    onClose,
}: ConfirmationStepProps) {
    const directResources = selectedResources.filter(
        (resource) => !resource.not_downloadable && (Boolean(resource.key) || Boolean(resource.url))
    );
    const selectedCount = directResources.length;
    const totalDirectBytes = directResources.reduce(
        (acc, resource) => acc + Number(resource.size ?? 0),
        0
    );
    const { download } = useDirectDownload(datasetName);
    const externallyHostedResources = selectedResources.filter(
        (resource) => Boolean(resource.not_downloadable) && Boolean(resource.url)
    );

    useEffect(() => {
        if (directResources.length === 0) {
            return;
        }

        void download(directResources);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const whatsNextItems = [
        {
            icon: <DocumentIcon width={16} height={16} />,
            title: 'View this dataset',
            description: 'Return to the dataset to explore more details.',
            action: 'View dataset',
            onClick: onClose,
        },
        {
            icon: <CodeBracketSquareIcon width={16} height={16} />,
            title: 'Access via API',
            description: 'Integrate this data into your tools and workflows.',
            action: 'View API options',
            onClick: () => {
                onClose();
                window.dispatchEvent(new Event('open-access-api-modal'));
            },
        },
        {
            icon: <ChatBubbleLeftEllipsisIcon width={16} height={16} />,
            title: 'Share your feedback',
            description: 'Help us improve our datasets and platform.',
            action: 'Leave feedback',
            onClick: () =>
                window.open(
                    'https://surveys.hotjar.com/4d284b81-6916-49cc-9f2a-811becdebd6b',
                    '_blank',
                    'noopener,noreferrer'
                ),
        },
        {
            icon: <UserIcon width={16} height={16} />,
            title: 'Take part in research',
            description: 'Sign up to take part in upcoming research to improve the Data Explorer.',
            action: 'Sign up',
            onClick: () =>
                window.open(
                    'https://surveys.hotjar.com/4d284b81-6916-49cc-9f2a-811becdebd6b',
                    '_blank',
                    'noopener,noreferrer'
                ),
        },
    ];

    const getResourceDescription = (resource: Resource) => {
        const description = resource.description?.trim() ?? '';
        if (description) {
            return description;
        }

        return 'Selected file included in this export.';
    };

    return (
        <div>
            {selectedCount > 0 && (
                <DownloadStartedBanner
                    variant="direct"
                    fileCount={selectedCount}
                    fileSize={formatFileSize(totalDirectBytes)}
                    onRetry={() => void download(directResources)}
                />
            )}

            {selectedCount > 0 && (
                <>
                    {/* What's included */}
                    <h3
                        style={{
                            fontSize: getThemedFontSize(600),
                            fontWeight: 700,
                            color: getThemedColor('neutral', 900),
                            marginBottom: getThemedSpacing(400),
                        }}
                    >
                        {"What's included"}
                    </h3>

                    {directResources.map((resource) => (
                        <div key={resource.id} style={{ marginBottom: getThemedSpacing(200) }}>
                            <FileCard
                                title={resource.title ?? resource.name ?? 'Selected file'}
                                badge={getResourceFormatLabel(resource)}
                                description={getResourceDescription(resource)}
                                createdAt={formatDate(resource.created)}
                                updatedAt={formatDate(resource.last_modified)}
                                rightContent={
                                    <span
                                        style={{
                                            fontSize: getThemedFontSize(400),
                                            color: getThemedColor('neutral', 800),
                                            flexShrink: 0,
                                            marginLeft: getThemedSpacing(400),
                                        }}
                                    >
                                        {formatFileSize(Number(resource.size ?? 0))}
                                    </span>
                                }
                            />
                        </div>
                    ))}

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: `${getThemedSpacing(300)} 0`,
                            marginBottom: getThemedSpacing(600),
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: getThemedSpacing(200),
                            }}
                        >
                            <DocumentTextIcon
                                width={16}
                                height={16}
                                color={getThemedColor('neutral', 800)}
                            />
                            <span
                                style={{
                                    fontSize: getThemedFontSize(400),
                                    fontWeight: 700,
                                    color: getThemedColor('neutral', 900),
                                }}
                            >
                                Total size
                            </span>
                            <span
                                style={{
                                    fontSize: getThemedFontSize(400),
                                    color: getThemedColor('neutral', 800),
                                }}
                            >
                                (estimated)
                            </span>
                        </div>
                        <span
                            style={{
                                fontSize: getThemedFontSize(400),
                                fontWeight: 700,
                                color: getThemedColor('neutral', 900),
                            }}
                        >
                            {formatFileSize(totalDirectBytes)}
                        </span>
                    </div>
                </>
            )}
            <ExternallyHostedResourcesSection resources={externallyHostedResources} />

            <hr
                style={{
                    border: 'none',
                    borderTop: `1px solid ${getThemedColor('neutral', 300)}`,
                    height: getThemedSpacing(200),
                    margin: 0,
                }}
            />
            {/* What's next */}
            <h3
                style={{
                    fontSize: getThemedFontSize(600),
                    fontWeight: 700,
                    color: getThemedColor('neutral', 900),
                    marginBottom: getThemedSpacing(400),
                    marginTop: getThemedSpacing(600),
                }}
            >
                {"What's next"}
            </h3>

            {whatsNextItems.map(({ icon, title, description, action, onClick }) => (
                <div
                    key={title}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: getThemedSpacing(400),
                        padding: `${getThemedSpacing(300)} 0`,
                    }}
                >
                    <div
                        style={{
                            background: getThemedColor('secondary', 200),
                            borderRadius: getThemedRadius(900),
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: getThemedColor('secondary', 700),
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                fontSize: getThemedFontSize(400),
                                fontWeight: 700,
                                color: getThemedColor('neutral', 900),
                            }}
                        >
                            {title}
                        </div>
                        <div
                            style={{
                                fontSize: getThemedFontSize(300),
                                color: getThemedColor('neutral', 700),
                            }}
                        >
                            {description}
                        </div>
                    </div>
                    <Button
                        variant="borderless"
                        size="small"
                        rightIcon={<ChevronRightIcon />}
                        onClick={onClick}
                    >
                        {action}
                    </Button>
                </div>
            ))}

            <div style={{ marginTop: getThemedSpacing(600) }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="secondary" size="default" onClick={onBack}>
                        Back
                    </Button>
                    <Button variant="secondary" size="default" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationStep;
