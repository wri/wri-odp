import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { ChevronLeftIcon, CopyIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import type {
    DatasetDetailsHeaderDataset,
    DatasetDetailsHeaderMenuItem,
    DatasetDetailsHeaderProps,
} from './types';
import useStickyHeader from './useStickyHeader';
import DatasetDetailsHeaderContent from './DatasetDetailsHeaderContent';
import DatasetDetailsHeaderSticky from './DatasetDetailsHeaderSticky';

function normalizeOpenInItems(
    dataset?: DatasetDetailsHeaderDataset
): DatasetDetailsHeaderMenuItem[] {
    const baseOpenIn = (dataset?.open_in ?? []).map((item: { title: string; url: string }) => ({
        label: item.title,
        value: item.url,
    }));

    const providerOpenIn: DatasetDetailsHeaderMenuItem[] =
        dataset?.provider === 'cartodb' && dataset.connectorUrl
            ? [{ label: 'Carto', value: dataset.connectorUrl }]
            : dataset?.provider === 'featureservice' && dataset.connectorUrl
              ? [{ label: 'ArcGIS', value: dataset.connectorUrl }]
              : dataset?.provider === 'gfw' && dataset.connectorUrl
                ? [{ label: 'GFW', value: dataset.connectorUrl }]
                : dataset?.provider === 'gee' && dataset.tableName
                  ? [
                        {
                            label: 'GEE',
                            value: `https://developers.google.com/earth-engine/datasets/catalog/${dataset.tableName.replaceAll('/', '_')}`,
                        },
                    ]
                  : (dataset?.sources ?? []).map((source, index) => ({
                        label:
                            (dataset?.sources?.length ?? 0) === 1
                                ? (dataset?.provider?.toUpperCase() ?? 'SOURCE')
                                : `Source ${index + 1}`,
                        value: source,
                    }));

    return [...baseOpenIn, ...providerOpenIn];
}

function DatasetDetailsHeader({
    datasetTitle,
    datasetDescription,
    datasetName,
    dataset,
}: DatasetDetailsHeaderProps) {
    const router = useRouter();
    const { headerRef, isSticky } = useStickyHeader();

    const copyLink = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL?.replace(/\/+$/, '') ?? ''}/datasets-v2/${dataset?.name ?? datasetName}`;
    const openInItems = normalizeOpenInItems(dataset);

    return (
        <>
            <div
                style={{
                    backgroundColor: getThemedColor('secondary', 100),
                    paddingTop: getThemedSpacing(800),
                }}
                className="flex justify-between items-center px-2"
            >
                <Button
                    variant="borderless"
                    size="default"
                    onClick={() => router.back()}
                    leftIcon={<ChevronLeftIcon />}
                >
                    <div
                        style={{
                            color: getThemedColor('neutral', 700),
                            fontWeight: 400,
                            fontSize: getThemedFontSize(300),
                        }}
                    >
                        Back to datasets
                    </div>
                </Button>

                <Button
                    variant="borderless"
                    size="default"
                    onClick={() => {
                        void navigator.clipboard.writeText(copyLink);
                    }}
                    rightIcon={<CopyIcon />}
                >
                    <div
                        style={{
                            color: getThemedColor('neutral', 700),
                            fontWeight: 400,
                            fontSize: getThemedFontSize(300),
                        }}
                    >
                        Copy Link
                    </div>
                </Button>
            </div>

            <div
                ref={headerRef}
                style={{
                    position: 'absolute',
                    top: '70px',
                }}
            />

            {!isSticky ? (
                <DatasetDetailsHeaderContent
                    datasetTitle={datasetTitle}
                    datasetDescription={datasetDescription}
                    openInItems={openInItems}
                />
            ) : (
                <DatasetDetailsHeaderSticky datasetTitle={datasetTitle} openInItems={openInItems} />
            )}
        </>
    );
}

export default DatasetDetailsHeader;
