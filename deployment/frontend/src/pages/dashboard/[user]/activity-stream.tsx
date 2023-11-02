import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import ActivityList from '@/components/dashboard/activitystream/ActivityList';
import Footer from "@/components/_shared/Footer";

export default function activityStream() {
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
