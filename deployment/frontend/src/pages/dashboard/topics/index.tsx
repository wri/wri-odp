import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import TopicList from '@/components/dashboard/topics/TopicList';
import Footer from "@/components/_shared/Footer";
import {NextSeo} from 'next-seo';

export default function topics() {
  return (
    <>
      <NextSeo title={`Topics - Dashboard`} />
      <Header />
      <Layout >
        <TopicList />
      </Layout>
      <Footer style='mt-0' />
    </>
  )
}

