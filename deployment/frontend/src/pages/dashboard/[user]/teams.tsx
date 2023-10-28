import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import TeamList from '@/components/dashboard/teams/TeamList';
import Footer from "@/components/_shared/Footer";

export default function teams() {
  return (
    <>
      <Header />
      <Layout >
        <TeamList />
      </Layout>
      <Footer />
    </>
  )
}


