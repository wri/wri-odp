import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import TeamList from '@/components/dashboard/teams/TeamList';
import Footer from "@/components/_shared/Footer";
import {NextSeo} from 'next-seo';

export default function teams() {
  return (
    <>
      <NextSeo title={`Teams - Dashboard`} />
      <Header />
      <Layout >
        <TeamList />
      </Layout>
      <Footer style='mt-0' />
    </>
  )
}


