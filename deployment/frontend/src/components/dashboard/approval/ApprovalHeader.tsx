import React from 'react'
import TableHeader from '../_shared/TableHeader'

function LeftNode() {
    return (
        <div className=" sm:flex flex-col sm:flex-row sm:items-center hidden  gap-y-3 font-normal text-base w-full sm:pl-6 ">
            <div className="w-2 h-2 rounded-full  my-auto hidden sm:block"></div>
            <div className="flex items-center sm:w-[30%]  gap-x-8 ml-2 ">
                <div> Dataset</div>
            </div>
            <div className="flex flex-col sm:flex-row ml-4 gap-y-2 sm:ml-0 sm:items-center gap-x-8 sm:w-[60%]  lg:w-1/2 sm:gap-x-6 lg:gap-x-16 xl:gap-x-[5.5rem]  xxl:gap-x-[5.5rem]">
                <div className="order-last sm:order-first">Date</div>
                <div className=""> User</div>
            </div>
            <div className=" lg:w-[55%] xl:w-[42%] xxl:w-[38%] 2xl:w-[34%]"></div>
        </div>
    )
}

export default function ApprovalHeader({
    Pagination,
}: {
    Pagination: React.ReactNode
}) {
    return (
        <TableHeader
            leftNode={<LeftNode />}
            leftstyle="py-2"
            rightStyle="py-2"
            Pagination={Pagination}
        />
    )
}
