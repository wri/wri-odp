import {
    getThemedColor,
    getThemedFontSize,
    getThemedRadius,
    getThemedSpacing,
    InlineMessage,
    Tag,
} from '@worldresources/wri-design-systems';

type FileCardProps = {
    title: string;
    badge: string;
    description: string;
    extraInfo?: string;
    createdAt?: string;
    updatedAt?: string;
    warningMessage?: string;
    rightContent?: React.ReactNode;
    borderless?: boolean;
    titleFontSize?: ReturnType<typeof getThemedFontSize>;
};

function FileCard({
    title,
    badge,
    description,
    extraInfo,
    createdAt,
    updatedAt,
    warningMessage,
    rightContent,
    borderless,
    titleFontSize,
}: FileCardProps) {
    return (
        <div
            style={{
                border: borderless ? 'none' : `1px solid ${getThemedColor('neutral', 300)}`,
                borderRadius: borderless ? '0' : getThemedRadius(400),
                padding: borderless ? 0 : getThemedSpacing(400),
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: getThemedSpacing(400),
                }}
            >
                <div>
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
                                fontSize: titleFontSize ?? getThemedFontSize(400),
                                fontWeight: 700,
                                color: getThemedColor('neutral', 900),
                            }}
                        >
                            {title}
                        </span>

                        <Tag label={badge} variant="success" />
                    </div>
                    <p
                        style={{
                            fontSize: getThemedFontSize(300),
                            color: getThemedColor('neutral', 700),
                            marginTop: getThemedSpacing(100),
                        }}
                    >
                        {description}
                    </p>
                    {extraInfo && (
                        <p
                            style={{
                                fontSize: getThemedFontSize(300),
                                color: getThemedColor('neutral', 700),
                                marginTop: getThemedSpacing(100),
                            }}
                        >
                            {extraInfo}
                        </p>
                    )}
                    {Boolean(createdAt ?? updatedAt) && (
                        <div
                            style={{
                                display: 'flex',
                                gap: getThemedSpacing(400),
                                fontSize: getThemedFontSize(300),
                                color: getThemedColor('neutral', 700),
                                marginTop: getThemedSpacing(100),
                            }}
                        >
                            {createdAt && <span>Created: {createdAt}</span>}
                            {updatedAt && <span>Last updated: {updatedAt}</span>}
                        </div>
                    )}
                </div>
                {rightContent}
            </div>

            {warningMessage && (
                <div style={{ marginTop: getThemedSpacing(200) }}>
                    <InlineMessage variant="warning" size="full-width" label={warningMessage} />
                </div>
            )}
        </div>
    );
}

export default FileCard;
