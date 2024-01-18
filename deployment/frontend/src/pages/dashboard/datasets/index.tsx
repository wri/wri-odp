import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import DatasetList from '@/components/dashboard/datasets/DatasetList';
import Footer from "@/components/_shared/Footer";
import {NextSeo} from 'next-seo';

export default function DatasetListPage() {
  return (
    <>
      <NextSeo title={`Datasets - Dashboard`} />
      <Header />
      <Layout >
        <DatasetList />
      </Layout>
      <Footer style='mt-0' />
    </>
  )
}


