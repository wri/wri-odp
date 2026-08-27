import {
    getThemedBorderWidth,
    getThemedColor,
    getThemedFontSize,
    getThemedLineHeight,
    getThemedRadius,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { type WriDataset } from '@/schema/ckan.schema';
import { additionalReadingTagLabels } from '@/utils/datasetMetadata';
import { getAdditionalReadingFromDataset } from '@/utils/additionalReading';

export type AdditionalReadingLink = {
    title: string;
    url: string;
    tag: string;
};

export function getAdditionalReadingLinks(dataset: WriDataset): AdditionalReadingLink[] {
    return getAdditionalReadingFromDataset(dataset);
}

export function hasAdditionalReading(dataset: WriDataset): boolean {
    return getAdditionalReadingLinks(dataset).length > 0;
}

export function getPrimaryAdditionalReadingUrl(dataset: WriDataset): string | undefined {
    return getAdditionalReadingLinks(dataset)[0]?.url;
}

export default function AdditionalReadingSection({ links }: { links: AdditionalReadingLink[] }) {
    if (!links.length) return null;

    return (
        <section id="additional-reading">
            <h2
                style={{
                    fontSize: getThemedFontSize(700),
                    fontWeight: 700,
                    paddingBottom: getThemedSpacing(300),
                }}
            >
                Additional Reading
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {links.map((reading, index) => (
                    <a
                        key={`${reading.url}-${index}`}
                        href={reading.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div
                            style={{
                                padding: getThemedSpacing(400),
                                borderRadius: getThemedRadius(300),
                                border: `${getThemedBorderWidth(100)} solid ${getThemedColor('neutral', 300)}`,
                            }}
                        >
                            <div
                                style={{
                                    lineHeight: getThemedLineHeight(600),
                                    fontSize: getThemedFontSize(400),
                                }}
                            >
                                {reading.title}
                            </div>

                            <div
                                style={{
                                    color: getThemedColor('neutral', 700),
                                    fontSize: getThemedFontSize(300),
                                }}
                            >
                                {additionalReadingTagLabels[reading.tag] ?? reading.tag}
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
