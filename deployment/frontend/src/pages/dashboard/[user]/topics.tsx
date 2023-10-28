import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import TopicList from '@/components/dashboard/topics/TopicList';
import Footer from "@/components/_shared/Footer";

export default function topics() {
  return (
    <>
      <Header />
      <Layout >
        <TopicList />
      </Layout>
      <Footer />
    </>
  )
}

