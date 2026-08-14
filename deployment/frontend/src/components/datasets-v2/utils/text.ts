export function hasValue(value: string | null | undefined): value is string {
    return Boolean(value?.trim());
}

export function toDisplay(value?: string | null): string | null {
    return hasValue(value) ? value : null;
}

export function unique(values: Array<string | null | undefined>): string[] {
    return Array.from(new Set(values.filter((value): value is string => hasValue(value))));
}

export function parseRelatedDatasets(value: string | undefined): string[] {
    if (!value?.trim()) {
        return [];
    }

    try {
        const parsed = JSON.parse(value) as unknown;
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
    } catch {
        // Fallback to comma/new-line format when extras are not JSON.
    }

    return value
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
}

export function stripCmsTypography(html: string): string {
    if (!html.trim()) {
        return '';
    }

    return html
        .replace(/<font\b[^>]*>/gi, '')
        .replace(/<\/font>/gi, '')
        .replace(/<small\b[^>]*>/gi, '')
        .replace(/<\/small>/gi, '')
        .replace(/\sstyle=(['"])(.*?)\1/gi, (_, quote: string, styleValue: string) => {
            const cleanedStyle = styleValue
                .split(';')
                .map((rule) => rule.trim())
                .filter(Boolean)
                .filter((rule) => {
                    const property = (rule.split(':')[0] ?? '').trim().toLowerCase();
                    return (
                        Boolean(property) && property !== 'font' && !property.startsWith('font-')
                    );
                })
                .join('; ');

            return cleanedStyle ? ` style=${quote}${cleanedStyle}${quote}` : '';
        });
}
