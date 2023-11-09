import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import UserList from '@/components/dashboard/users/UserList';
import Footer from "@/components/_shared/Footer";

export default function topics() {
  return (
    <>
      <Header />
      <Layout >
        <UserList />
      </Layout>
      <Footer style='mt-0' />
    </>
  )
}

