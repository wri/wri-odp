import { type WriDataset } from '@/schema/ckan.schema';
import type { MenuItemProps, MenuProps } from '@worldresources/wri-design-systems';

export type DatasetDetailsHeaderProps = {
    datasetTitle: string;
    datasetDescription: string;
    datasetName: string;
    dataset?: WriDataset;
};

export type DatasetDetailsHeaderMenuItem = Pick<MenuItemProps, 'label' | 'value' | 'startIcon'>;

export type DatasetDetailsHeaderActionsProps = {
    variant: 'default' | 'sticky';
    openInItems: DatasetDetailsHeaderMenuItem[];
    openInItemsAndAccessApi: DatasetDetailsHeaderMenuItem[];
    sectionItems: DatasetDetailsHeaderMenuItem[];
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
