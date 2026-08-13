import {
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { type WriDataset } from '@/schema/ckan.schema';
import { hasValue, toDisplay, unique } from '../utils/text';

type MetadataItem = {
    label: string;
    value: string;
};

type Props = {
    dataset: WriDataset;
    authorNames: string[];
    additionalMetadataItems: MetadataItem[];
    restrictionsHtml: string;
    cmsContentClassName: string;
};

function MetadataRow({ label, values }: { label: string; values: string[] }) {
    if (!values.length) {
        return null;
    }

    return (
        <div
            style={{
                display: 'flex',
                gap: getThemedSpacing(200),
                alignItems: 'flex-start',
                padding: `${getThemedSpacing(100)} 0`,
            }}
        >
            <p
                style={{
                    color: getThemedColor('neutral', 700),
                    fontSize: getThemedFontSize(400),
                    lineHeight: '24px',
                    width: '150px',
                    flexShrink: 0,
                }}
            >
                {label}
            </p>
            <p
                style={{
                    color: getThemedColor('secondary', 800),
                    fontSize: getThemedFontSize(400),
                    lineHeight: '24px',
                    textDecorationLine: 'underline',
                    textDecorationStyle: 'dotted',
                }}
            >
                {values.join(', ')}
            </p>
        </div>
    );
}

export default function AdditionalMetadataSection({
    dataset,
    authorNames,
    additionalMetadataItems,
    restrictionsHtml,
    cmsContentClassName,
}: Props) {
    const topicNames = unique(
        (dataset.groups ?? [])
            .filter((group) => group.type === 'group')
            .map((group) => toDisplay(group.display_name ?? group.title ?? group.name))
    );

    const applicationNames = unique([
        ...((dataset.applications ?? []).map((app) =>
            toDisplay(app.display_name ?? app.title ?? app.name)
        ) ?? []),
        ...((dataset.groups ?? [])
            .filter((group) => group.type === 'application')
            .map((group) => toDisplay(group.display_name ?? group.title ?? group.name)) ?? []),
    ]);

    const keywordNames = unique(
        (dataset.tags ?? []).map((tag) => toDisplay(tag.display_name ?? tag.name))
    );

    const metadataRows: Array<{ label: string; values: string[] }> = [
        { label: 'Topic(s):', values: topicNames },
        { label: 'Application:', values: applicationNames },
        { label: 'Keywords:', values: keywordNames },
        { label: 'Authors:', values: unique(authorNames.map((name) => toDisplay(name))) },
        ...additionalMetadataItems.map((item) => ({
            label: `${item.label}:`,
            values: [item.value],
        })),
    ];

    return (
        <section id="additional-metadata">
            <h2
                style={{
                    fontSize: getThemedFontSize(700),
                    fontWeight: 700,
                }}
            >
                Additional metadata
            </h2>

            <div>
                {metadataRows.map((row) => (
                    <MetadataRow key={row.label} label={row.label} values={row.values} />
                ))}
            </div>

            {hasValue(restrictionsHtml) && (
                <>
                    <h3 className="font-semibold pt-4">Restrictions</h3>
                    <div
                        className={cmsContentClassName}
                        dangerouslySetInnerHTML={{
                            __html: restrictionsHtml,
                        }}
                    ></div>
                </>
            )}
        </section>
    );
}
