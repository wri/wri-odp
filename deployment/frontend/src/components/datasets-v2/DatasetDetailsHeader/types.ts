import type { MenuItemProps, MenuProps } from '@worldresources/wri-design-systems';

export type DatasetDetailsHeaderDataset = {
    name?: string;
    open_in?: Array<{ title: string; url: string }>;
    provider?: string;
    connectorUrl?: string;
    sources?: string[];
    tableName?: string;
};

export type DatasetDetailsHeaderProps = {
    datasetTitle: string;
    datasetDescription: string;
    datasetName: string;
    dataset?: DatasetDetailsHeaderDataset;
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
    datasetTitle: string;
    datasetDescription: string;
    openInItems: DatasetDetailsHeaderMenuItem[];
};

export type DatasetDetailsHeaderStickyProps = {
    datasetTitle: string;
    openInItems: DatasetDetailsHeaderMenuItem[];
};

export type DatasetDownloadButtonProps = {
    size: 'default' | 'small';
};
