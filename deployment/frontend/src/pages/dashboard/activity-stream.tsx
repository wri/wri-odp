import React from 'react'
import type { GetServerSideProps } from "next";
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import ActivityList from '@/components/dashboard/activitystream/ActivityList';
import Footer from "@/components/_shared/Footer";
import { getServerAuthSession } from "../../server/auth";

export default function ActivityStream() {

  return (
    <>
      <Header />
      <Layout >
        <ActivityList />
      </Layout>
      <Footer style='mt-0' />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};

