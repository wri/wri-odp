import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import Dashboard from '@/components/dashboard/Dashboard';
import Footer from "@/components/_shared/Footer";
import { getServerAuthSession } from "../../../server/auth";
import type { GetServerSideProps } from "next";

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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};
