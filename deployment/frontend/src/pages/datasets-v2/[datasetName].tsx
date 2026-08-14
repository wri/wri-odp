import { type GetServerSideProps, type InferGetServerSidePropsType } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { env } from '@/env.mjs';
import { getServerAuthSession } from '@/server/auth';
import { getOneDataset } from '@/utils/apiUtils';
import { type WriDataset } from '@/schema/ckan.schema';

// Disable SSR for design-system components to avoid Chakra context being
// unavailable during server-side rendering (CJS vs ESM module instance mismatch).
const DatasetV2Content = dynamic(() => import('@/components/datasets-v2/DatasetV2Content'), {
    ssr: false,
});

// import DatasetV2Content from '@/components/datasets-v2/DatasetV2Content';
// causes this error: useContext returned `undefined`. Seems you forgot to wrap component within <ChakraProvider />

type PageProps = {
    dataset: WriDataset;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
    if (['production', 'prod'].includes(env.NEXT_PUBLIC_DEPLOYMENT_TYPE)) {
        return {
            notFound: true,
        };
    }

    const datasetName = context.params?.datasetName;

    if (!datasetName || typeof datasetName !== 'string') {
        return {
            notFound: true,
        };
    }

    const session = await getServerAuthSession(context);

    try {
        const dataset = await getOneDataset(datasetName, session, true);
        const serializableDataset = JSON.parse(JSON.stringify(dataset)) as WriDataset;

        return {
            props: {
                dataset: serializableDataset,
            },
        };
    } catch {
        return {
            notFound: true,
        };
    }
};

export default function DatasetV2Page({
    dataset,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const datasetTitle = dataset.title ?? dataset.name;

    return (
        <>
            <Head>
                <title>Datasets V2 | {datasetTitle}</title>
            </Head>
            <DatasetV2Content dataset={dataset} />
        </>
    );
}
