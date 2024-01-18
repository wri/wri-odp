import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import Approvallist from '@/components/dashboard/approval/Approvallist';
import Footer from "@/components/_shared/Footer";
import {NextSeo} from 'next-seo';

export default function index() {
  return (
    <>
      <NextSeo title={`Approval Request - Dashboard`} />
      <Header />
      <Layout >
        <Approvallist />
      </Layout>
      <Footer style='mt-0' />
    </>
  )
}
