import type { ReactNode } from 'react';
import { type WriDataset } from '@/schema/ckan.schema';
import type { MenuItemProps, MenuProps } from '@worldresources/wri-design-systems';

export type DatasetDetailsHeaderProps = {
    datasetTitle: string;
    datasetDescription: string;
    datasetName: string;
    dataset?: WriDataset;
    sectionItems: DatasetSectionItem[];
    /** When false, the header content is centered and capped while backgrounds stay full width. */
    hasMap?: boolean;
    /**
     * When provided, the condensed header is controlled by the caller instead of
     * the internal scroll sentinel. Used by the detail page to render the
     * condensed header as a sibling of the header block, so its sticky
     * containing block spans the whole page column.
     */
    isSticky?: boolean;
};

export type DatasetDetailsHeaderActionsProps = {
    dataset: WriDataset;
    /** Extra actions rendered next to the favourites/edit shortcuts (e.g. Copy Link) */
    extraItems?: ReactNode;
};

export type DatasetDetailsHeaderMenuItem = Pick<MenuItemProps, 'label' | 'value' | 'startIcon'>;

export type DatasetSectionItem = {
    label: string;
    value: string;
};

export type DatasetDetailsHeaderDataset = {
    name?: string;
    open_in?: WriDataset['open_in'];
    provider?: WriDataset['provider'];
    connectorUrl?: WriDataset['connectorUrl'];
    tableName?: WriDataset['tableName'];
    sources?: string[];
};

export type DatasetDetailsHeaderOpenInActionsProps = {
    variant: 'default' | 'sticky';
    openInItems: DatasetDetailsHeaderMenuItem[];
    openInItemsAndAccessApi: DatasetDetailsHeaderMenuItem[];
    sectionItems: DatasetSectionItem[];
    onOpenInSelect: NonNullable<MenuProps['onSelect']>;
    onSectionSelect?: NonNullable<MenuProps['onSelect']>;
};

export type DatasetDetailsHeaderContentProps = {
    dataset: WriDataset;
    datasetTitle: string;
    datasetDescription: string;
    openInItems: DatasetDetailsHeaderMenuItem[];
    /** When false, the header content is centered and capped while backgrounds stay full width. */
    hasMap?: boolean;
};

export type DatasetDetailsHeaderStickyProps = {
    dataset: WriDataset;
    datasetTitle: string;
    openInItems: DatasetDetailsHeaderMenuItem[];
    sectionItems: DatasetSectionItem[];
    /** When false, the sticky content is centered and capped while the bar stays full width. */
    hasMap?: boolean;
};

export type DatasetDownloadButtonProps = {
    dataset: WriDataset;
    size: 'default' | 'small';
};

export type AccessApiButtonProps = {
    dataset: WriDataset;
    hideButton?: boolean;
    isAccessApiModalOpen?: boolean;
};
