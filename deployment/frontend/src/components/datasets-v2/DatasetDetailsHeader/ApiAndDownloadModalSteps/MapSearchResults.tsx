import {
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { type CSSProperties } from 'react';

/** Minimal option shape handed back to the map: geocoder id plus its label. */
export type MapSearchResultOption = {
    id: string;
    label: string;
};

type MapSearchResultItem = {
    id?: string | number;
    label?: unknown;
    searchLabel?: string;
};

const MAX_RESULTS_HEIGHT = 220;

// Mirrors the design system results rows (padding 200/300, font 400), so the
// custom panel reads as part of the same input.
const rowStyle: CSSProperties = {
    padding: `${getThemedSpacing(200)} ${getThemedSpacing(300)}`,
    fontSize: getThemedFontSize(400),
    lineHeight: getThemedFontSize(600),
    color: getThemedColor('neutral', 900),
    cursor: 'pointer',
};

const highlightedRowStyle: CSSProperties = {
    ...rowStyle,
    backgroundColor: getThemedColor('neutral', 200),
};

const statusStyle: CSSProperties = {
    padding: `${getThemedSpacing(200)} ${getThemedSpacing(300)}`,
    fontSize: getThemedFontSize(400),
    lineHeight: getThemedFontSize(600),
    color: getThemedColor('neutral', 700),
};

const listStyle: CSSProperties = {
    maxHeight: MAX_RESULTS_HEIGHT,
    overflowY: 'auto',
};

function normalizeText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

/** `label` is a `ReactNode` on `ListItemProps`; only text labels are highlighted. */
function getOptionText(item: MapSearchResultItem): string {
    if (typeof item.label === 'string') {
        return item.label;
    }

    if (typeof item.label === 'number') {
        return String(item.label);
    }

    return item.searchLabel ?? '';
}

// Highlights the part of the label matching the query, ignoring case and
// diacritics (`"bogota"` highlights `"Bogotá"`). Matching runs on normalized
// strings, which keeps the indexes aligned with the original label.
function highlightMatch({ label, query }: { label: string; query: string }) {
    const normalizedQuery = normalizeText(query);
    const start = normalizedQuery ? normalizeText(label).indexOf(normalizedQuery) : -1;

    if (start === -1) {
        return label;
    }

    const end = start + normalizedQuery.length;

    return (
        <>
            {label.slice(0, start)}
            <strong>{label.slice(start, end)}</strong>
            {label.slice(end)}
        </>
    );
}

type MapSearchResultsProps = {
    /** Options after the `Search` filter, in geocoder order. */
    options?: MapSearchResultItem[];
    /** Query typed in the `Search` input, used for the highlight. */
    query: string;
    /** Receives the option id, or the label when the option has no id. */
    onSelect: (optionId: string) => void;
    isLoading: boolean;
    /** Whether the query was actually sent to the geocoder. */
    isQueryValid: boolean;
    /** Row under the keyboard cursor, owned by the parent so Enter agrees. */
    highlightedIndex?: number;
    /** Reports hover so the parent cursor follows the pointer. */
    onHighlight?: (index: number) => void;
};

/**
 * Results panel for the map location search. The `Search` input owns the field
 * and its callbacks, while this component paints the rows inside the panel the
 * header anchors under the input. Rendering the geocoder rows directly (instead
 * of `Search`'s `displayResults` panel) keeps accent and other-language hits —
 * `"bogota"` vs `"Bogotá"` — that its literal filter would drop.
 */
export default function MapSearchResults({
    options = [],
    query,
    onSelect,
    isLoading,
    isQueryValid,
    highlightedIndex = -1,
    onHighlight,
}: MapSearchResultsProps) {
    if (isLoading) {
        return (
            <div style={statusStyle} role="status">
                Searching…
            </div>
        );
    }

    if (options.length === 0) {
        return (
            <div style={statusStyle} role="status">
                {isQueryValid ? 'No locations found.' : 'Keep typing to search locations.'}
            </div>
        );
    }

    return (
        <div style={listStyle} role="listbox">
            {options.map((option, index) => {
                const optionId = String(option.id ?? getOptionText(option));

                return (
                    <div
                        key={optionId}
                        role="option"
                        aria-selected={index === highlightedIndex}
                        style={index === highlightedIndex ? highlightedRowStyle : rowStyle}
                        onMouseEnter={() => onHighlight?.(index)}
                        // Keeps the click from blurring the input first, which
                        // would close the panel before the selection lands.
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => onSelect(optionId)}
                    >
                        {highlightMatch({ label: getOptionText(option), query })}
                    </div>
                );
            })}
        </div>
    );
}
