import Header from '@/components/_shared/Header'
import Footer from '@/components/_shared/Footer'
import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
import { Hero } from '@/components/applications/Hero'
import { api } from '@/utils/api'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import DatasetApplication from '@/components/applications/DatasetApplication'
import { getServerAuthSession } from '@/server/auth'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { appRouter } from '@/server/api/root'
import { createServerSideHelpers } from '@trpc/react-query/server'
import superjson from 'superjson'
import { env } from '@/env.mjs'

export async function getServerSideProps(
    context: GetServerSidePropsContext<{ applicationName: string }>
) {
    const session = await getServerAuthSession(context)
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session },
        transformer: superjson,
    })
    try {
        const applicationName = context.params?.applicationName as string
        const [_datasets, _application] = await Promise.all([
            await helpers.dataset.getAllDataset.fetch({
                search: '',
                fq: {
                    groups: applicationName,
                },
                page: {
                    start: 0,
                    rows: 100,
                },
            }),
            await helpers.applications.getApplication.fetch({
                id: applicationName,
            }),
        ])
        return {
            props: {
                trpcState: helpers.dehydrate(),
                applicationName,
            },
        }
    } catch (e) {
        return {
            props: {},
            redirect: {
                destination: '/applications/404',
            },
        }
    }
}

export default function ApplicationPage(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    const { data: application } = api.applications.getApplication.useQuery({
        id: props.applicationName ?? '',
    })
    const router = useRouter()

    const applicationName = props.applicationName as string
    const applicationTitle =
        application?.title ?? application?.name ?? 'Application'

    const links = [
        {
            label: `Applications`,
            url: `/applications`,
            current: false,
        },
        {
            label: applicationTitle,
            url: `/applications/${applicationName}`,
            current: true,
        },
    ]

    return (
        <>
            <NextSeo
                title={`${applicationTitle} - Applications`}
                description={`WRI Open Data Catalog Application - ${applicationTitle}`}
                openGraph={{
                    title: `${applicationTitle} - Applications`,
                    description: `WRI Open Data Catalog Application - ${applicationTitle}`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/application/${applicationName}`,
                }}
            />
            <Header />
            <Breadcrumbs links={links} />
            {application && (
                <>
                    <Hero application={application} />
                    <div className="mx-auto grid w-full max-w-[1380px] gap-y-4 px-4 mt-20 font-acumin sm:px-6 xxl:px-0">
                        <DatasetApplication application={application} />
                    </div>
                </>
            )}

            <Footer
                links={{
                    primary: { title: 'Explore Topics', href: '/topics' },
                    secondary: { title: 'Explore Teams', href: '/teams' },
                }}
            />
        </>
    )
}
