import React from 'react'
import TableHeader from '../_shared/TableHeader'
import SelectFilter from '../_shared/SelectFilter'

function LeftNode() {
  return (
    <div className='flex w-full gap-x-4 pl-6 pr-2 sm:pr-0 pt-2 sm:pt-0'>
      <SelectFilter
        options={[
          { id: 1, label: "All activity" },
          { id: 2, label: "Name" },
          { id: 3, label: "Title" },
        ]} />
      <SelectFilter
        options={[
          { id: 1, label: "All teams" },
          { id: 2, label: "Name" },
          { id: 3, label: "Title" },
        ]} />
      <SelectFilter
        options={[
          { id: 1, label: "All times" },
          { id: 2, label: "Name" },
          { id: 3, label: "Title" },
        ]} />
    </div>
  )

}

export default function ActivitystreamHeader() {
  return (
    <TableHeader leftNode={<LeftNode />} rightStyle='sm:mt-4' />
  )
}
