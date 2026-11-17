import { normalizeApprovedTag } from '@/utils/approvedTags';

export type KeywordEntry = {
    label: string;
    value: string;
};

/**
 * Keywords displayed on the dataset page. Only approved keywords are shown,
 * using the approved spelling as the label; `value` keeps the stored tag name
 * so the search link matches the indexed value.
 *
 * Tags are de-duplicated case-insensitively because Solr indexes them that way,
 * so `Economy`, `economy` and `ECONOMY` are a single keyword.
 */
export function getApprovedKeywordEntries(
    tags: Array<{ name: string }> | undefined
): KeywordEntry[] {
    const seen = new Set<string>();
    const entries: KeywordEntry[] = [];

    for (const tag of tags ?? []) {
        const key = tag.name.trim().toLowerCase();
        if (!key || seen.has(key)) continue;

        const approved = normalizeApprovedTag(tag.name);
        if (!approved) continue;

        seen.add(key);
        entries.push({ label: approved, value: tag.name });
    }

    return entries;
}
