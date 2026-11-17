import { describe, expect, it } from 'vitest';
import { getApprovedKeywordEntries } from '../src/components/datasets-v2/utils/keywords';

describe('getApprovedKeywordEntries', () => {
    it('keeps only approved keywords', () => {
        const entries = getApprovedKeywordEntries([
            { name: 'Economy' },
            { name: 'mental health' },
            { name: 'government' },
            { name: 'Health' },
        ]);

        expect(entries).toEqual([
            { label: 'Economy', value: 'Economy' },
            { label: 'Health', value: 'Health' },
        ]);
    });

    it('uses the approved spelling as label and keeps the stored name as value', () => {
        expect(getApprovedKeywordEntries([{ name: 'water quality' }])).toEqual([
            { label: 'Water Quality', value: 'water quality' },
        ]);
    });

    it('de-duplicates keywords that differ only by case', () => {
        expect(
            getApprovedKeywordEntries([
                { name: 'Economy' },
                { name: 'economy' },
                { name: 'ECONOMY' },
            ])
        ).toEqual([{ label: 'Economy', value: 'Economy' }]);
    });

    it('returns an empty list when no keyword is approved', () => {
        expect(getApprovedKeywordEntries([{ name: 'tags 1' }, { name: 'subscriable' }])).toEqual(
            []
        );
    });

    it('handles a missing tag list', () => {
        expect(getApprovedKeywordEntries(undefined)).toEqual([]);
    });
});
