import type { ReactNode } from 'react';
import { type WriDataset } from '@/schema/ckan.schema';
import type { MenuItemProps, MenuProps } from '@worldresources/wri-design-systems';

export type DatasetDetailsHeaderProps = {
    datasetTitle: string;
    datasetDescription: string;
    datasetName: string;
    dataset?: WriDataset;
    sectionItems: DatasetSectionItem[];
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
};

export type DatasetDetailsHeaderStickyProps = {
    dataset: WriDataset;
    datasetTitle: string;
    openInItems: DatasetDetailsHeaderMenuItem[];
    sectionItems: DatasetSectionItem[];
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
