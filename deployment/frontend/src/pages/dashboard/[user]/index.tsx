import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import Dashboard from '@/components/dashboard/Dashboard';
import Footer from "@/components/_shared/Footer";

export default function index() {
  return (
    <>
      <Header />
      <Layout >
        <Dashboard />
      </Layout>
      <Footer
        links={{
          primary: { title: "Advanced Search", href: "/search" },
          secondary: { title: "Explore Topics", href: "/topics" },
        }}
        style='mt-0'
      />
    </>
  )
}
