import {
    getThemedFontSize,
    getThemedSpacing,
    InlineMessage,
} from '@worldresources/wri-design-systems';
import DatasetTable from './DatasetTable';
import { type WriDataset } from '@/schema/ckan.schema';
import Navigation from './Navigation';
import DatasetV2Map from './DatasetMap';
import DatasetDetailsHeader from './DatasetDetailsHeader';

type Props = {
    datasetName: string;
    datasetTitle: string;
    datasetDescription: string;
    datasetId: string;
    licenseTitle: string;
    layerRwId: string | null;
    dataset?: WriDataset;
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
    return (
        <>
            <Navigation />
            <div className={layerRwId ? 'flex flex-col md:flex-row' : 'flex flex-col'}>
                <section className={layerRwId ? 'flex-1' : 'w-full'}>
                    <DatasetDetailsHeader
                        datasetTitle={datasetTitle}
                        datasetDescription={datasetDescription}
                        datasetName={datasetName}
                        dataset={dataset}
                    />

                    <section id="key-details" style={{ scrollMarginTop: getThemedSpacing(700) }}>
                        <DatasetTable
                            datasetId={datasetId}
                            licenseTitle={licenseTitle}
                            dataset={dataset}
                        />
                    </section>

                    <section
                        style={{
                            padding: getThemedSpacing(700),
                            scrollMarginTop: getThemedSpacing(700),
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
                        <section id="description">
                            <h2
                                style={{
                                    fontSize: getThemedFontSize(700),
                                    fontWeight: 700,
                                }}
                            >
                                Description
                            </h2>
                            <div
                                className="prose max-w-none prose-sm prose-a:text-wri-green prose-pre:bg-pre-code prose-pre:text-black prose-pre:text-base"
                                dangerouslySetInnerHTML={{
                                    __html: dataset?.notes ?? '',
                                }}
                            ></div>
                        </section>

                        <section id="additional-reading">{/* Additional Reading */}</section>

                        <section id="citation">
                            {dataset?.citation && (
                                <>
                                    <h2
                                        style={{
                                            fontSize: getThemedFontSize(700),
                                            fontWeight: 700,
                                        }}
                                    >
                                        Citation
                                    </h2>
                                    <p>{dataset?.citation ?? ' - '}</p>
                                </>
                            )}
                        </section>

                        <section id="methodology">{/* Methodology */}</section>

                        <section id="contact-details">{/* Contact details */}</section>

                        <section id="related-datasets">{/* Related datasets */}</section>

                        <section id="release-notes">{/* Release notes */}</section>

                        <section id="additional-metadata">{/* Additional metadata */}</section>
                    </section>
                </section>
                {layerRwId ? (
                    <section
                        className="flex-1 md:sticky md:top-12 md:self-start md:h-[calc(100vh-48px)] overflow-hidden"
                        style={{ backgroundColor: 'lightgray' }}
                    >
                        <DatasetV2Map datasetId={datasetId} layerRwId={layerRwId} />
                    </section>
                ) : null}
            </div>
        </>
    );
}
