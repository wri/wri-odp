import React, { useState } from 'react'
import { EyeIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import classNames from '@/utils/classnames';

type RowButton = {
  label?: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

type RowLinkButton = {
  label?: string;
  link?: string;
}

type RowProps = {
  rowMain: React.ReactNode;
  rowSub?: React.ReactNode;
  isDropDown?: boolean;
  controlButtons?: RowButton[];
  linkButton?: RowLinkButton;
  bgColor?: boolean
  className?: string;
}

export default function Row({ rowMain, rowSub, isDropDown, controlButtons, linkButton, bgColor, className }: RowProps) {
  const [isShowSubRow, setIsShowSubRow] = useState(false)
  return (
    <div className={`flex flex-col hover:bg-slate-100 ${isShowSubRow ? "bg-slate-100" : " "} ${className ? className : ""} group`}>
      <div className='flex flex-col sm:flex-row '>
        <div className=' grow shrink'>
          {rowMain}
        </div>
        <div className='flex gap-x-4 ml-auto h-8 self-center'>
          {(linkButton) ? (
            <a href={linkButton.link} className={`flex invisible items-center gap-x-2 px-3 py-2 rounded-md  border border-wri-gold font-semibold text-[15px] group-hover:visible `}>
              <span>{linkButton.label}</span>
              <EyeIcon className="h-6 w-6 text-black " />
            </a>
          ) : ""}
          {(controlButtons) ? controlButtons.map((button, index) => {
            return (
              <button key={index} onClick={button.onClick} className={`my-auto flex  items-center justify-center invisible group-hover:visible w-8 h-8 rounded-full ${index === 1 ? "bg-wri-gold" : " bg-red-600"} `}>
                {(button.icon)}
              </button>
            )
          }) : ""}

          {(isDropDown) ? (
            <button className={`flex items-center gap-x-2 px-2 py-1 rounded-md`}
              onClick={() => setIsShowSubRow(!isShowSubRow)}
            >
              {isShowSubRow ? (<ChevronUpIcon className=' w-4 h-4 text-black' />) : (<ChevronDownIcon className=' w-4 h-4 text-black' />)}
            </button>
          ) : ""}
        </div>
      </div>
      {
        isShowSubRow && (
          <div id="sub-row">
            {(rowSub) ? rowSub : ""}
          </div>
        )
      }
    </div>
  )
}
