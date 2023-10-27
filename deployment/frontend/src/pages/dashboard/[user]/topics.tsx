import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import TopicList from '@/components/dashboard/topics/TopicList';

export default function topics() {
  return (
    <>
      <Header />
      <Layout >
        <TopicList />
      </Layout>
    </>
  )
}

