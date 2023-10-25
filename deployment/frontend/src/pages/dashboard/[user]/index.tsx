import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import Dashboard from '@/components/dashboard/Dashboard';

export default function index() {
  return (
    <>
      <Header />
      <Layout >
        <Dashboard />
      </Layout>
    </>
  )
}
