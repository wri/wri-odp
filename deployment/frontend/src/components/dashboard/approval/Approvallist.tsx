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
    <section id="approval" className=' max-w-sm sm:max-w-8xl  w-full flex flex-col gap-y-5 sm:gap-y-0'>
      <ApprovalHeader />
      <div className='w-full'>
        {
          approval.map((approvalInfo, index) => (
            <ApprovalRow key={index} approvalInfo={approvalInfo} className={index % 2 === 0 ? ' bg-[#F9F9F9] hover:bg-slate-100' : ''} />
          ))
        }
      </div>

    </section>
  )
}
