import {
    getThemedColor,
    getThemedFontSize,
    getThemedRadius,
    getThemedSpacing,
    Tag,
} from '@worldresources/wri-design-systems';

type FileCardProps = {
    title: string;
    badge: string;
    description: string;
    extraInfo?: string;
    createdAt?: string;
    updatedAt?: string;
    rightContent?: React.ReactNode;
};

function FileCard({
    title,
    badge,
    description,
    extraInfo,
    createdAt,
    updatedAt,
    rightContent,
}: FileCardProps) {
    return (
        <div
            style={{
                border: `1px solid ${getThemedColor('neutral', 300)}`,
                borderRadius: getThemedRadius(400),
                padding: getThemedSpacing(400),
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
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
                            fontSize: getThemedFontSize(400),
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
                {(createdAt || updatedAt) && (
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
    );
}

export default FileCard;
