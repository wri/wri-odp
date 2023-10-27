import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import DatasetList from '@/components/dashboard/datasets/DatasetList';

export default function datasets() {
  return (
    <>
      <Header />
      <Layout >
        <DatasetList />
      </Layout>
    </>
  )
}


