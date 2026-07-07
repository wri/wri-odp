import {
    Button,
    getThemedColor,
    getThemedFontSize,
    getThemedSpacing,
    InlineMessage,
    Menu,
} from '@worldresources/wri-design-systems';
import { ArrowDownTrayIcon, GlobeAltIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { CopyIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import DatasetTable, { type DatasetV2KeyDetails } from './DatasetTable';
import Navigation from './Navigation';
import DatasetV2Map from './DatasetMap';

type Props = {
    datasetName: string;
    datasetTitle: string;
    datasetDescription: string;
    datasetId: string;
    licenseTitle: string;
    layerRwId: string | null;
    dataset?: DatasetV2KeyDetails;
};

export default function DatasetV2Content({
    datasetName,
    datasetTitle,
    datasetDescription,
    datasetId,
    licenseTitle,
    layerRwId,
    dataset,
}: Props) {
    const router = useRouter();

    const copyLink = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL?.replace(/\/+$/, '') ?? ''}/datasets-v2/${dataset?.name ?? datasetName}`;
    const rawOpenIn = (dataset as { open_in?: unknown } | undefined)?.open_in;
    const openInEntries: Array<{ title: string; url: string }> = Array.isArray(rawOpenIn)
        ? rawOpenIn.filter((item): item is { title: string; url: string } => {
              if (typeof item !== 'object' || item === null) return false;
              const candidate = item as Record<string, unknown>;
              return typeof candidate.title === 'string' && typeof candidate.url === 'string';
          })
        : [];

    const openInItems = openInEntries
        .filter((item) => !!item.url)
        .map((item, index) => ({
            label: item.title,
            value: `open-in-${index}`,
            onClick: () => {
                window.open(item.url, '_blank', 'noopener,noreferrer');
            },
        }));

    return (
        <>
            <Navigation />
            <div className={layerRwId ? 'flex flex-col md:flex-row' : 'flex flex-col'}>
                <section className={layerRwId ? 'flex-1' : 'w-full'}>
                    <div
                        style={{
                            backgroundColor: getThemedColor('secondary', 100),
                            paddingTop: getThemedSpacing(800),
                        }}
                        className="flex justify-between items-center px-2 w-100"
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
                        className="font-acumin"
                        style={{
                            backgroundColor: getThemedColor('secondary', 100),
                            padding: `${getThemedSpacing(800)} ${getThemedSpacing(600)} ${getThemedSpacing(900)} ${getThemedSpacing(600)}`,
                            borderBottom: `1px solid ${getThemedColor('neutral', 300)}`,
                        }}
                    >
                        <h1
                            style={{
                                fontSize: getThemedFontSize(900),
                                color: getThemedColor('secondary', 900),
                                fontStyle: 'normal',
                                fontWeight: 700,
                            }}
                        >
                            {datasetTitle}
                        </h1>
                        <p className="mt-4 text-lg text-stone-600">
                            {datasetDescription || 'No description.'}
                        </p>
                        <div
                            style={{
                                display: 'flex',
                                gap: getThemedSpacing(400),
                                marginTop: getThemedSpacing(400),
                            }}
                        >
                            <Button
                                variant="primary"
                                size="default"
                                onClick={() => {
                                    console.log('Open Document button clicked');
                                }}
                                leftIcon={<ArrowDownTrayIcon />}
                            >
                                Download
                            </Button>
                            <Button
                                variant="secondary"
                                size="default"
                                onClick={() => {
                                    console.log('Open Document button clicked');
                                }}
                                leftIcon={<GlobeAltIcon />}
                            >
                                Access API
                            </Button>

                            {openInItems.length > 0 && (
                                <Menu
                                    label="Open in"
                                    items={openInItems}
                                    hideArrow
                                    customTrigger={
                                        <Button
                                            variant="secondary"
                                            size="default"
                                            rightIcon={<ChevronDownIcon />}
                                        >
                                            Open in app
                                        </Button>
                                    }
                                />
                            )}
                        </div>
                    </div>
                    <DatasetTable
                        datasetId={datasetId}
                        licenseTitle={licenseTitle}
                        dataset={dataset}
                    />
                    <div
                        style={{
                            padding: getThemedSpacing(700),
                        }}
                    >
                        <InlineMessage
                            size="full-width"
                            variant="warning"
                            label="Caution for using this dataset"
                            caption="This dataset uses a different definition of a tree and a different definition of tree cover than does Hansen et al. (2013). This dataset defines a tree according to both the height and crown diameter. Woody..."
                            actionLabel="Read more"
                            onActionClick={() => {
                                console.log('Read more clicked');
                            }}
                        />
                    </div>
                </section>
                {layerRwId ? (
                    <section className="flex-1" style={{ backgroundColor: 'lightgray' }}>
                        <DatasetV2Map datasetId={datasetId} layerRwId={layerRwId} />
                    </section>
                ) : null}
            </div>
        </>
    );
}
