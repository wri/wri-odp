import { describe, expect, it } from 'vitest';
import {
    approvedTags,
    filterApprovedTags,
    normalizeApprovedTag,
} from '../src/utils/approvedTags';

describe('approvedTags', () => {
    it('exposes the full approved keyword list', () => {
        expect(approvedTags.length).toBe(756);
    });

    it('has no duplicates and no blank entries', () => {
        expect(new Set(approvedTags).size).toBe(approvedTags.length);
        expect(approvedTags.every((tag) => tag.trim().length > 0)).toBe(true);
    });

    it('keeps entries trimmed', () => {
        expect(approvedTags.filter((tag) => tag !== tag.trim())).toEqual([]);
    });

    it('includes keywords with commas and diacritics', () => {
        expect(approvedTags).toContain('Water, Sanitation, and Hygiene');
        expect(approvedTags).toContain('Escazú Agreement');
        expect(approvedTags).toContain('Köppen Climate Classification');
    });
});

describe('normalizeApprovedTag', () => {
    it('returns the canonical spelling regardless of case and padding', () => {
        expect(normalizeApprovedTag('  economy ')).toBe('Economy');
        expect(normalizeApprovedTag('AIR QUALITY')).toBe('Air Quality');
    });

    it('returns undefined for keywords outside the approved list', () => {
        expect(normalizeApprovedTag('mental health')).toBeUndefined();
        expect(normalizeApprovedTag('')).toBeUndefined();
    });
});

describe('filterApprovedTags', () => {
    it('drops legacy keywords and keeps approved ones', () => {
        expect(filterApprovedTags(['economy', 'mental health', 'Air Quality'])).toEqual([
            'Air Quality',
            'Economy',
        ]);
    });

    it('de-duplicates case-insensitive repeats', () => {
        expect(filterApprovedTags(['Economy', 'economy', 'ECONOMY'])).toEqual(['Economy']);
    });

    it('returns an empty list when nothing is approved', () => {
        expect(filterApprovedTags(['foo', 'bar'])).toEqual([]);
    });
});

describe('search facet filtering', () => {
    // Mirrors the filter applied to the "tags" facet in FilteredSearchLayout.
    const filterFacetItems = (items: Array<{ name: string; count: number }>) =>
        items.filter((item) => Boolean(normalizeApprovedTag(item.name)));

    it('keeps approved facets and drops unapproved ones', () => {
        const items = [
            { name: 'Air Quality', count: 3 },
            { name: 'raster', count: 2 },
            { name: 'keyword', count: 1 },
            { name: 'Agriculture', count: 4 },
        ];

        expect(filterFacetItems(items).map((i) => i.name)).toEqual(['Air Quality', 'Agriculture']);
    });

    it('keeps approved facets whose stored spelling is not canonical', () => {
        // Solr matches tag values case-sensitively, so these must not be renamed.
        const items = [
            { name: 'sanitation', count: 1 },
            { name: 'ghg', count: 3 },
            { name: 'water quality', count: 1 },
        ];

        expect(filterFacetItems(items)).toEqual(items);
    });

    it('drops facets that only differ by an unapproved suffix', () => {
        const items = [
            { name: 'keyword 2', count: 1 },
            { name: 'public-records-request', count: 1 },
        ];

        expect(filterFacetItems(items)).toEqual([]);
    });
});
