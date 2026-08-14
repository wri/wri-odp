import { api } from '@/utils/api';
import { type WriDataset } from '@/schema/ckan.schema';
import Link from 'next/link';
import {
    getThemedBorderWidth,
    getThemedColor,
    getThemedFontSize,
    getThemedRadius,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';

type Props = {
    dataset: WriDataset;
};

function normalizeKeyword(value?: string | null): string {
    return (value ?? '').trim().toLowerCase();
}

function getDatasetKeywords(dataset: WriDataset): string[] {
    return (dataset.tags ?? [])
        .map((tag) => normalizeKeyword(tag.display_name ?? tag.name))
        .filter((keyword): keyword is string => keyword.length > 0);
}

export function hasDatasetKeywords(dataset: WriDataset): boolean {
    return getDatasetKeywords(dataset).length > 0;
}

function getSharedKeywordCount(dataset: WriDataset, baseKeywords: string[]): number {
    const baseKeywordSet = new Set(baseKeywords);
    const candidateKeywords = getDatasetKeywords(dataset);

    return candidateKeywords.filter((keyword) => baseKeywordSet.has(keyword)).length;
}

function getDatasetDescription(dataset: WriDataset): string {
    const description = dataset.short_description?.trim();

    if (description) {
        return description;
    }

    const notes = dataset.notes
        ?.replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return notes || 'No description available.';
}

export default function RelatedDatasetsSection({ dataset }: Props) {
    const keywords = getDatasetKeywords(dataset);
    const searchTerm = keywords.join(' ');

    const { data, isLoading } = api.dataset.getAllDataset.useQuery(
        {
            search: searchTerm,
            page: {
                start: 0,
                rows: 30,
            },
        },
        {
            enabled: keywords.length > 0,
        }
    );

    const relatedDatasets = (data?.datasets ?? [])
        .filter((item) => item.id !== dataset.id)
        .map((item) => ({
            item,
            sharedKeywordCount: getSharedKeywordCount(item, keywords),
        }))
        .filter(({ sharedKeywordCount }) => sharedKeywordCount > 0)
        .sort((a, b) => b.sharedKeywordCount - a.sharedKeywordCount)
        .slice(0, 3)
        .map(({ item }) => item);

    return (
        <section id="related-datasets">
            <h2
                style={{
                    fontSize: getThemedFontSize(700),
                    fontWeight: 700,
                    paddingBottom: getThemedSpacing(300),
                }}
            >
                Related datasets
            </h2>

            {isLoading ? (
                <p>Loading related datasets...</p>
            ) : relatedDatasets.length === 0 ? (
                <p>No related datasets found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedDatasets.map((relatedDataset) => (
                        <Link
                            key={relatedDataset.id}
                            href={`/datasets-v2/${relatedDataset.name}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <article
                                style={{
                                    padding: getThemedSpacing(400),
                                    borderRadius: getThemedRadius(300),
                                    border: `${getThemedBorderWidth(100)} solid ${getThemedColor('neutral', 300)}`,
                                    height: '100%',
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: getThemedFontSize(400),
                                        fontWeight: 700,
                                        color: getThemedColor('secondary', 800),
                                        margin: 0,
                                        paddingBottom: getThemedSpacing(200),
                                    }}
                                >
                                    {relatedDataset.title ?? relatedDataset.name}
                                </h3>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: getThemedFontSize(300),
                                        color: getThemedColor('neutral', 700),
                                        fontWeight: 400,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 8,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {getDatasetDescription(relatedDataset)}
                                </p>
                            </article>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
