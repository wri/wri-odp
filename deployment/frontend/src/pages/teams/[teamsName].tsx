import React from 'react'
import Header from '@/components/_shared/Header'
import TeamHeaderCard from '@/components/team/TeamHeaderCard'
import TeamTab from '@/components/team/TeamTab'
import Footer from '@/components/_shared/Footer'
import { Breadcrumbs } from "@/components/_shared/Breadcrumbs";


const links = [
  { label: "Teams", url: "/teams", current: false },
  { label: "Team 1", url: "/topics/team1", current: true },
];

export default function teams() {
  return (
    <>
      <Header />
      <Breadcrumbs links={links} />
      <TeamHeaderCard />
      <TeamTab />
      <Footer />
    </>
  )
}
