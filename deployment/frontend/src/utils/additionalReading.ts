import { type WriDataset } from '@/schema/ckan.schema';

const allowedTags = new Set([
    'article',
    'publication',
    'documentation',
    'report',
    'blog_post',
]);

function isHttpUrl(value: string): boolean {
    return value.startsWith('http://') || value.startsWith('https://');
}

function normalizeItems(value: unknown): NonNullable<WriDataset['additional_reading']> {
    if (!Array.isArray(value)) return [];

    return value
        .map((item) => {
            const link = item as {
                title?: unknown;
                url?: unknown;
                tag?: unknown;
            };

            const title = typeof link.title === 'string' ? link.title.trim() : '';
            const url = typeof link.url === 'string' ? link.url.trim() : '';
            const tag = typeof link.tag === 'string' ? link.tag.trim() : '';

            if (!title || !url || !isHttpUrl(url) || !allowedTags.has(tag)) return null;

            return {
                title,
                url,
                tag: tag as
                    | 'article'
                    | 'publication'
                    | 'documentation'
                    | 'report'
                    | 'blog_post',
            };
        })
        .filter((item): item is NonNullable<typeof item> => !!item);
}

function parseJson(raw: unknown): NonNullable<WriDataset['additional_reading']> {
    if (Array.isArray(raw)) return normalizeItems(raw);
    if (typeof raw !== 'string' || !raw.trim()) return [];

    try {
        return normalizeItems(JSON.parse(raw));
    } catch {
        return [];
    }
}

export function getAdditionalReadingFromDataset(
    dataset: WriDataset
): NonNullable<WriDataset['additional_reading']> {
    const fromField = parseJson(dataset.additional_reading);
    if (fromField.length > 0) return fromField;

    const extras = dataset.extras ?? [];
    const fromExtra = extras.find(
        (extra) => extra.key?.toLowerCase() === 'additional_reading'
    );
    const parsedFromExtras = parseJson(fromExtra?.value);
    if (parsedFromExtras.length > 0) return parsedFromExtras;

    if (dataset.learn_more && isHttpUrl(dataset.learn_more)) {
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
