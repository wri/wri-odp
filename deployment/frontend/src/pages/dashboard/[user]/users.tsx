import React from 'react'
import Header from '@/components/_shared/Header'
import Layout from "@/components/dashboard/Layout";
import UserList from '@/components/dashboard/users/UserList';

export default function topics() {
  return (
    <>
      <Header />
      <Layout >
        <UserList />
      </Layout>
    </>
  )
}

