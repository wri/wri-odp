import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from '@/components/dashboard/Layout'
import Footer from '@/components/_shared/Footer'
import { getServerAuthSession } from '../../../../server/auth'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { NextSeo } from 'next-seo'
import { api } from '@/utils/api'
import Spinner from '@/components/_shared/Spinner'
import UserForm from '@/components/dashboard/users/UserForm'
import { User } from '@portaljs/ckan'
import { Tab } from '@headlessui/react'
import { SettingsTabs } from '@/components/dashboard/users/SettingsTabs'
import { ApiKeys } from '@/components/dashboard/users/ApiKeys'

export async function getServerSideProps(
    context: GetServerSidePropsContext<{ username: string }>
) {
    const session = await getServerAuthSession(context)
    const username = context.params?.username
    const existSession = session!
    if (
        !session &&
        (username !== existSession?.user?.name || existSession?.user?.sysadmin)
    ) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        }
    }

    return {
        props: {
            session,
            username,
        },
    }
}

export default function User(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    const username = props.username!
    const { data, isLoading } = api.user.getUser.useQuery(username)
    const { data: apiTokens } = api.user.getUserApiTokens.useQuery()

    if (isLoading) {
        return <Spinner />
    }

    return (
        <>
            <NextSeo title={`User Profile setting`} />
            <Header />
            <Layout>
                <Tab.Group>
                    <Tab.List className="flex max-w-8xl mx-auto w-full pt-8">
                        <SettingsTabs />
                    </Tab.List>
                    <Tab.Panels className="mt-2">
                        <Tab.Panel>
                            <UserForm user={data?.userdetails as User} />
                        </Tab.Panel>
                        <Tab.Panel>
                            <ApiKeys apiTokens={apiTokens ?? []} />
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </Layout>
            <Footer
                links={{
                    primary: { title: 'Advanced Search', href: '/search' },
                    secondary: { title: 'Explore Topics', href: '/topics' },
                }}
                style="mt-0"
            />
        </>
    )
}
