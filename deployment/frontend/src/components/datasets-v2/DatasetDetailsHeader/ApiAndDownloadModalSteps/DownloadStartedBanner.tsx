import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedLineHeight,
    getThemedRadius,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { CheckIcon } from '@heroicons/react/24/outline';

type DownloadStartedBannerProps = {
    variant: 'direct' | 'email';
    fileCount: number;
    fileSize: string;
    email?: string;
    onRetry?: () => void;
};

function DownloadStartedBanner({
    variant,
    fileCount,
    fileSize,
    email,
    onRetry,
}: DownloadStartedBannerProps) {
    const sharedContainerStyle = {
        border: `1px solid ${getThemedColor('secondary', 200)}`,
        borderRadius: getThemedRadius(300),
        background: getThemedColor('secondary', 100),
    };

    if (variant === 'email') {
        return (
            <div
                style={{
                    ...sharedContainerStyle,
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: getThemedSpacing(400),
                    paddingTop: getThemedSpacing(500),
                    paddingBottom: getThemedSpacing(600),
                    paddingLeft: getThemedSpacing(300),
                    paddingRight: getThemedSpacing(300),
                    marginBottom: getThemedSpacing(600),
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: getThemedSpacing(500),
                    }}
                >
                    <div
                        style={{
                            background: getThemedColor('secondary', 600),
                            borderRadius: '50%',
                            width: '64px',
                            height: '64px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: 'white',
                        }}
                    >
                        <CheckIcon width={32} height={32} />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: getThemedSpacing(200),
                        }}
                    >
                        <p
                            style={{
                                fontSize: getThemedFontSize(700),
                                fontWeight: 700,
                                color: getThemedColor('neutral', 900),
                                lineHeight: getThemedLineHeight(800),
                            }}
                        >
                            Your files have been sent
                        </p>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: getThemedSpacing(100),
                                paddingBottom: getThemedSpacing(200),
                            }}
                        >
                            <p
                                style={{
                                    fontSize: getThemedFontSize(400),
                                    color: getThemedColor('neutral', 800),
                                    lineHeight: getThemedLineHeight(600),
                                }}
                            >
                                We've prepared your {fileCount} files ({fileSize}) and sent a
                                download link to:
                            </p>
                            <p
                                style={{
                                    fontSize: getThemedFontSize(500),
                                    fontWeight: 700,
                                    color: getThemedColor('neutral', 800),
                                    lineHeight: getThemedLineHeight(700),
                                }}
                            >
                                {email}
                            </p>
                        </div>
                        <p
                            style={{
                                fontSize: getThemedFontSize(300),
                                color: getThemedColor('neutral', 700),
                                lineHeight: getThemedLineHeight(500),
                            }}
                        >
                            Your download will be ready shortly. Your link will expire in 7 days.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                ...sharedContainerStyle,
                display: 'flex',
                alignItems: 'flex-start',
                gap: getThemedSpacing(400),
                padding: getThemedSpacing(500),
                marginBottom: getThemedSpacing(600),
            }}
        >
            <div
                style={{
                    background: getThemedColor('secondary', 500),
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'white',
                }}
            >
                <CheckIcon width={20} height={20} />
            </div>
            <div>
                <h2
                    style={{
                        fontSize: getThemedFontSize(700),
                        fontWeight: 700,
                        color: getThemedColor('neutral', 900),
                        marginBottom: getThemedSpacing(100),
                        lineHeight: getThemedLineHeight(800),
                    }}
                >
                    Your download has started
                </h2>
                <p
                    style={{
                        fontSize: getThemedFontSize(400),
                        color: getThemedColor('neutral', 800),
                        lineHeight: getThemedLineHeight(600),
                    }}
                >
                    Your {fileCount} files ({fileSize}) should begin downloading automatically.{' '}
                    <br /> If nothing happens after a few seconds, retry your download below.
                </p>
                {onRetry && (
                    <Button
                        variant="secondary"
                        size="small"
                        leftIcon={<ArrowPathIcon />}
                        style={{ marginTop: getThemedSpacing(400) }}
                        onClick={onRetry}
                    >
                        Retry download
                    </Button>
                )}
            </div>
        </div>
    );
}

export default DownloadStartedBanner;
