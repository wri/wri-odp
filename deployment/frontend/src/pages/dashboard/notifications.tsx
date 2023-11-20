import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import NotificationList from '@/components/dashboard/notification/NotificationList'
import Footer from "@/components/_shared/Footer";
import {NextSeo} from 'next-seo';

export default function Notifications() {
  return (
    <>
      <NextSeo title={`Notifications - Dashboard`} />
      <Header />
      <Layout >
        <NotificationList />
      </Layout>
      <Footer style='mt-0' />
    </>
  )
}
