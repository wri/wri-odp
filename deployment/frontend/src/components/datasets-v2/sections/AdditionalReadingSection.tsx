import {
    getThemedBorderWidth,
    getThemedColor,
    getThemedFontSize,
    getThemedLineHeight,
    getThemedRadius,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { type WriDataset } from '@/schema/ckan.schema';

export type AdditionalReadingLink = {
    title: string;
    url: string;
    tag: string;
};

const additionalReadingTagLabels: Record<string, string> = {
    article: 'Article',
    publication: 'Publication',
    documentation: 'Documentation',
    report: 'Report',
    blog_post: 'Blog post',
};

export function getAdditionalReadingLinks(dataset: WriDataset): AdditionalReadingLink[] {
    const rawAdditionalReading = (dataset as unknown as Record<string, unknown>).additional_reading;

    const links = Array.isArray(rawAdditionalReading)
        ? rawAdditionalReading
              .map((item) => {
                  const link = item as {
                      title?: unknown;
                      url?: unknown;
                      tag?: unknown;
                  };

                  if (
                      typeof link.title !== 'string' ||
                      typeof link.url !== 'string' ||
                      typeof link.tag !== 'string'
                  ) {
                      return null;
                  }

                  return {
                      title: link.title,
                      url: link.url,
                      tag: link.tag,
                  };
              })
              .filter((item): item is AdditionalReadingLink => item !== null)
        : [];

    if (links.length > 0) return links;

    if (dataset.learn_more) {
        return [
            {
                title: 'Learn more',
                url: dataset.learn_more,
                tag: 'documentation',
            },
        ];
    }

    return [];
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
