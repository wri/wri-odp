export function hasValue(value: string | null | undefined): value is string {
    return Boolean(value?.trim());
}

export function toDisplay(value?: string | null): string | null {
    return hasValue(value) ? value : null;
}

export function unique(values: Array<string | null | undefined>): string[] {
    return Array.from(new Set(values.filter((value): value is string => hasValue(value))));
}
