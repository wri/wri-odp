import React from 'react'
import ApprovalHeader from './ApprovalHeader'
import ApprovalRow from './ApprovalRow'

const approval = [
  {
    dataset: "Name of dataset",
    rowId: "#10",
    date: "11 Oct 2023",
    user: {
      title: "someone@wri.org"
    },
    status: true
  },
  {
    dataset: "Name of dataset",
    rowId: "#10",
    date: "11 Oct 2023",
    user: {
      title: "someone@wri.org"
    },
    status: true
  },
  {
    dataset: "Name of dataset",
    rowId: "#10",
    date: "11 Oct 2023",
    user: {
      title: "someone@wri.org"
    },
    status: true
  }
  ,
  {
    dataset: "Name of dataset",
    rowId: "#10",
    date: "11 Oct 2023",
    user: {
      title: "someone@wri.org"
    },
    status: true
  }
  ,
  {
    dataset: "Name of dataset",
    rowId: "#10",
    date: "11 Oct 2023",
    user: {
      title: "someone@wri.org"
    },
    status: true
  }
  ,
  {
    dataset: "Name of dataset",
    rowId: "#10",
    date: "11 Oct 2023",
    user: {
      title: "someone@wri.org"
    },
    status: true
  }
  ,
  {
    dataset: "Name of dataset",
    rowId: "#10",
    date: "11 Oct 2023",
    user: {
      title: "someone@wri.org"
    },
    status: true
  }
  ,
  {
    dataset: "Name of dataset",
    rowId: "#10",
    date: "11 Oct 2023",
    user: {
      title: "someone@wri.org"
    },
    status: true
  }
  ,
  {
    dataset: "Name of dataset",
    rowId: "#10",
    date: "11 Oct 2023",
    user: {
      title: "someone@wri.org"
    },
    status: true
  }
  ,
  {
    dataset: "Name of dataset",
    rowId: "#10",
    date: "11 Oct 2023",
    user: {
      title: "someone@wri.org"
    },
    status: true
  }
  ,
  {
    dataset: "Name of dataset",
    rowId: "#10",
    date: "11 Oct 2023",
    user: {
      title: "someone@wri.org"
    },
    status: true
  }
]

export default function Approvallist() {
  return (
    <section id="approval" className='w-[819px] overflow-x-auto max-w-8xl  lg:w-full'>
      <ApprovalHeader />
      {
        approval.map((approvalInfo, index) => (
          <ApprovalRow key={index} approvalInfo={approvalInfo} className={index % 2 === 0 ? ' bg-[#F9F9F9]' : ''} />
        ))
      }
    </section>
  )
}
