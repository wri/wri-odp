import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import UserList from '@/components/dashboard/users/UserList';
import Footer from "@/components/_shared/Footer";
import {NextSeo} from 'next-seo';

export default function topics() {
  return (
    <>
      <NextSeo title={`Users - Dashboard`} />
      <Header />
      <Layout >
        <UserList />
      </Layout>
      <Footer style='mt-0' />
    </>
  )
}

