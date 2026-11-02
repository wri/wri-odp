import { type GetServerSideProps, type InferGetServerSidePropsType } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useState } from 'react';
import { env } from '@/env.mjs';
import { getServerAuthSession } from '@/server/auth';
import { getOneDataset, getOnePendingDataset, getRecipient } from '@/utils/apiUtils';
import { type WriDataset } from '@/schema/ckan.schema';
import { api } from '@/utils/api';
import { matchesAnyPattern } from '@/utils/general';
import ApprovalRequestCard from '@/components/datasets/ApprovalRequestCard';
import ToggleVersion from '@/components/datasets/ToogleVersion';
import DatasetV2Layout from '@/components/datasets-v2/DatasetV2Layout';

// Disable SSR for design-system components to avoid Chakra context being
// unavailable during server-side rendering (CJS vs ESM module instance mismatch).
const DatasetV2Content = dynamic(() => import('@/components/datasets-v2/DatasetV2Content'), {
    ssr: false,
});

// import DatasetV2Content from '@/components/datasets-v2/DatasetV2Content';
// causes this error: useContext returned `undefined`. Seems you forgot to wrap component within <ChakraProvider />

type PageProps = {
    dataset: WriDataset;
    prevDataset: WriDataset | null;
    pendingExist: boolean;
    isPendingState: boolean;
    approvalAuth: boolean;
    generalAuthorized: boolean;
    is_approved: boolean | null;
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
        const prevDataset = await getOneDataset(datasetName, session, true);
        let dataset = prevDataset;
        let pendingExist = false;
        let approvalAuth = false;
        let generalAuthorized = false;

        if (session) {
            const pendingDataset = await getOnePendingDataset(datasetName, session, true);
            let userAuthorize = false;
            if (prevDataset.owner_org) {
                const orgdetails = await getRecipient({ owner_org: prevDataset.owner_org });
                userAuthorize = !!orgdetails?.find((x) => x.id === session.user.id);
                approvalAuth = !!orgdetails
                    ?.filter((x) => x.capacity === 'admin')
                    .find((x) => x.id === session.user.id);
            } else if (prevDataset.creator_user_id === session.user.id) {
                userAuthorize = true;
            }
            approvalAuth = !!session.user.sysadmin || approvalAuth;
            generalAuthorized = !!session.user.sysadmin || userAuthorize;
            pendingExist =
                !!pendingDataset && generalAuthorized && Object.keys(pendingDataset).length > 0;
            if (pendingExist && pendingDataset) dataset = pendingDataset;
        }

        return {
            props: JSON.parse(
                JSON.stringify({
                    dataset,
                    prevDataset: pendingExist ? prevDataset : null,
                    pendingExist,
                    isPendingState: pendingExist && dataset.approval_status === 'pending',
                    approvalAuth,
                    generalAuthorized,
                    is_approved: prevDataset.is_approved ?? null,
                })
            ) as PageProps,
        };
    } catch {
        return {
            notFound: true,
        };
    }
};

export default function DatasetV2Page({
    dataset,
    prevDataset,
    pendingExist,
    isPendingState,
    approvalAuth,
    generalAuthorized,
    is_approved,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [isCurrentVersion, setIsCurrentVersion] = useState(false);
    const datasetTitle = dataset.title ?? dataset.name;

    const { data: diffData } = api.dataset.showPendingDiff.useQuery(
        { id: dataset.id },
        { enabled: pendingExist, retry: 0 }
    );

    const diffFields = diffData?.diff
        ? Object.keys(diffData.diff).filter((item) => {
              if (item.includes('resources') && item.includes('title')) {
                  const rtitle = diffData.diff[item]?.old_value;
                  return !(rtitle === 'null' || rtitle === null);
              }
              return matchesAnyPattern(item);
          })
        : [];

    const banner = pendingExist ? (
        <>
            {approvalAuth && isPendingState && (
                <div className="flex-1">
                    <ApprovalRequestCard
                        datasetName={dataset.name}
                        datasetTitle={dataset.title}
                        owner_org={dataset.owner_org || null}
                        creator_id={dataset.creator_user_id || null}
                        datasetId={dataset.id}
                        diffField={diffFields}
                    />
                </div>
            )}
            {generalAuthorized && diffFields.length > 0 && (
                <div className="ml-auto flex h-20 items-center px-4">
                    <ToggleVersion
                        enabled={isCurrentVersion}
                        setEnabled={setIsCurrentVersion}
                        is_approved={!!is_approved}
                        approval_status={dataset.approval_status ?? ''}
                    />
                </div>
            )}
        </>
    ) : null;

    return (
        <>
            <Head>
                <title>Datasets V2 | {datasetTitle}</title>
            </Head>
            <DatasetV2Layout banner={banner}>
                <DatasetV2Content
                    dataset={isCurrentVersion && prevDataset ? prevDataset : dataset}
                    diffFields={isCurrentVersion ? [] : diffFields}
                />
            </DatasetV2Layout>
        </>
    );
}
