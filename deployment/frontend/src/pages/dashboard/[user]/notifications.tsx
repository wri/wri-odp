import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import NotificationList from '@/components/dashboard/notification/NotificationList'


export default function Notifications() {
  return (
    <>
      <Header />
      <Layout >
        <NotificationList />
      </Layout>
    </>
  )
}
