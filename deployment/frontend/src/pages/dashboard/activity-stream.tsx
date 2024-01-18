import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import ActivityList from '@/components/dashboard/activitystream/ActivityList';
import Footer from "@/components/_shared/Footer";
import {NextSeo} from 'next-seo';

export default function activityStream() {
  return (
    <>
      <NextSeo title={`Activity Stream - Dashboard`} />
      <Header />
      <Layout >
        <ActivityList />
      </Layout>
      <Footer style='mt-0' />
    </>
  )
}
