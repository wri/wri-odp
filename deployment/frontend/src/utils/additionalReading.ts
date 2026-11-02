import { type WriDataset } from '@/schema/ckan.schema';

type AdditionalReadingTag = NonNullable<WriDataset['additional_reading']>[number]['tag'];

const allowedTags = new Set<AdditionalReadingTag>([
    'publication',
    'documentation',
    'source_code',
    'announcement',
]);

// Tags used before the additional reading categories were redefined.
const legacyTagMap: Record<string, AdditionalReadingTag> = {
    article: 'publication',
    report: 'publication',
    blog_post: 'publication',
};

function normalizeTag(value: string): AdditionalReadingTag | undefined {
    if (allowedTags.has(value as AdditionalReadingTag)) {
        return value as AdditionalReadingTag;
    }
    return legacyTagMap[value];
}

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
            const rawTag = typeof link.tag === 'string' ? link.tag.trim() : '';
            const tag = normalizeTag(rawTag);

            if (!title || !url || !isHttpUrl(url) || !tag) return null;

            return {
                title,
                url,
                tag,
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
    const fromExtra = extras.find((extra) => extra.key?.toLowerCase() === 'additional_reading');
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
