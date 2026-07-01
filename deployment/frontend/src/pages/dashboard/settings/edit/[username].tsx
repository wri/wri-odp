import { TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import React from 'react';
import Header from '@/components/_shared/Header';
import Layout from '@/components/dashboard/Layout';
import Footer from '@/components/_shared/Footer';
import { getServerAuthSession } from '../../../../server/auth';
import {
    type GetServerSidePropsContext,
    type InferGetServerSidePropsType,
} from 'next';
import { NextSeo } from 'next-seo';
import { api } from '@/utils/api';
import Spinner from '@/components/_shared/Spinner';
import UserForm from '@/components/dashboard/users/UserForm';
import { type User } from '@portaljs/ckan';
import { SettingsTabs } from '@/components/dashboard/users/SettingsTabs';
import { ApiKeys } from '@/components/dashboard/users/ApiKeys';

export async function getServerSideProps(
    context: GetServerSidePropsContext<{ username: string }>
) {
    const session = await getServerAuthSession(context);
    const username = context.params?.username;
    const existSession = session!;
    if (
        !session &&
        (username !== existSession?.user?.name || existSession?.user?.sysadmin)
    ) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    return {
        props: {
            session,
            username,
        },
    };
}

export default function User(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    const username = props.username!;
    const { data, isLoading } = api.user.getUser.useQuery(username);
    const { data: apiTokens } = api.user.getUserApiTokens.useQuery();

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <>
            <NextSeo title={`User Profile setting`} />
            <Header />
            <Layout>
                <TabGroup>
                    <TabList className="flex max-w-8xl mx-auto w-full pt-8">
                        <SettingsTabs />
                    </TabList>
                    <TabPanels className="mt-2">
                        <TabPanel>
                            <UserForm user={data?.userdetails as User} />
                        </TabPanel>
                        <TabPanel>
                            <ApiKeys apiTokens={apiTokens ?? []} />
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </Layout>
            <Footer
                links={{
                    primary: { title: 'Search', href: '/search' },
                    secondary: { title: 'Explore Topics', href: '/topics' },
                }}
                style="mt-0"
            />
        </>
    );
}
