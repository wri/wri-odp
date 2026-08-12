import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
} from '@worldresources/wri-design-systems';
import { ChevronLeftIcon, CopyIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import type { DatasetDetailsHeaderProps } from './types';
import useStickyHeader from './useStickyHeader';
import DatasetDetailsHeaderContent from './DatasetDetailsHeaderContent';
import DatasetDetailsHeaderSticky from './DatasetDetailsHeaderSticky';
import { normalizeOpenInItems } from './utils';

function DatasetDetailsHeader({
    datasetTitle,
    datasetDescription,
    datasetName,
    dataset,
    sectionItems,
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
                    dataset={dataset}
                    datasetTitle={datasetTitle}
                    datasetDescription={datasetDescription}
                    openInItems={openInItems}
                />
            ) : (
                <DatasetDetailsHeaderSticky
                    dataset={dataset}
                    datasetTitle={datasetTitle}
                    openInItems={openInItems}
                    sectionItems={sectionItems}
                />
            )}
        </>
    );
}

export default DatasetDetailsHeader;
