import { type GetServerSideProps, type InferGetServerSidePropsType } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { getServerAuthSession } from '@/server/auth';
import { getOneDataset } from '@/utils/apiUtils';
import { type DatasetV2KeyDetails } from '@/components/datasets-v2/DatasetTable';

// Disable SSR for design-system components to avoid Chakra context being
// unavailable during server-side rendering (CJS vs ESM module instance mismatch).
const DatasetV2Content = dynamic<{
    datasetName: string;
    datasetTitle: string;
    datasetDescription: string;
    datasetId: string;
    licenseTitle: string;
    layerRwId: string | null;
    dataset?: DatasetV2KeyDetails;
}>(() => import('@/components/datasets-v2/DatasetV2Content'), { ssr: false });

// import DatasetV2Content from '@/components/datasets-v2/DatasetV2Content';
// causes this error: useContext returned `undefined`. Seems you forgot to wrap component within <ChakraProvider />

type PageProps = {
    datasetName: string;
    datasetTitle: string;
    datasetDescription: string;
    datasetId: string;
    licenseTitle: string;
    layerRwId: string | null;
    dataset?: DatasetV2KeyDetails;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
    const datasetName = context.params?.datasetName;

    if (!datasetName || typeof datasetName !== 'string') {
        return {
            notFound: true,
        };
    }

    const session = await getServerAuthSession(context);

    try {
        const dataset = await getOneDataset(datasetName, session, true);
        const layerResource = dataset.resources?.find(
            (resource: { format?: string; rw_id?: string | null }) =>
                resource?.format === 'Layer' || !!resource?.rw_id
        );

        return {
            props: {
                datasetName,
                datasetTitle: dataset.title ?? dataset.name,
                datasetDescription: dataset.short_description ?? '',
                datasetId: dataset.id,
                licenseTitle: dataset.license_title ?? '',
                layerRwId: layerResource?.rw_id ?? null,
                dataset,
            },
        };
    } catch {
        return {
            notFound: true,
        };
    }
};

export default function DatasetV2Page({
    datasetName,
    datasetTitle,
    datasetDescription,
    datasetId,
    licenseTitle,
    layerRwId,
    dataset,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <>
            <Head>
                <title>Datasets V2 | {datasetTitle}</title>
            </Head>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}

            <DatasetV2Content
                datasetName={datasetName}
                datasetTitle={datasetTitle}
                datasetDescription={datasetDescription}
                datasetId={datasetId}
                licenseTitle={licenseTitle}
                layerRwId={layerRwId}
                dataset={dataset}
            />
        </>
    );
}
