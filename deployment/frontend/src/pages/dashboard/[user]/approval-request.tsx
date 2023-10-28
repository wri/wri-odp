import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import Approvallist from '@/components/dashboard/approval/Approvallist';
import Footer from "@/components/_shared/Footer";

export default function index() {
  return (
    <>
      <Header />
      <Layout >
        <Approvallist />
      </Layout>
      <Footer />
    </>
  )
}
