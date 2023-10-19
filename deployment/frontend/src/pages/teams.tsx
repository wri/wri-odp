import React from 'react'
import Header from '@/components/_shared/Header'
import TeamHeaderCard from '@/components/team/TeamHeaderCard'
import TeamTab from '@/components/team/TeamTab'
import Footer from '@/components/_shared/Footer'

export default function teams() {
  return (
    <>
      <Header />
      <TeamHeaderCard />
      <TeamTab />
      <Footer />
    </>
  )
}
