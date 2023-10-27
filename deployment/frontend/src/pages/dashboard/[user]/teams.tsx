import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import TeamList from '@/components/dashboard/teams/TeamList';

export default function teams() {
  return (
    <>
      <Header />
      <Layout >
        <TeamList />
      </Layout>
    </>
  )
}


