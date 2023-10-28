import React, { useState } from 'react'
import { EyeIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';


type RowButton = {
  label?: string;
  icon?: React.ReactNode;
  color?: string;
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
  groupStyle?: string
  className?: string;
}

export default function Row({ rowMain, rowSub, isDropDown, controlButtons, linkButton, groupStyle, className }: RowProps) {
  const [isShowSubRow, setIsShowSubRow] = useState(false)
  // state event to change hover effect on desktop to click effect on mobile
  // const [isHover, setIsHover] = useState(false)
  const enableControlDiv = (isDropDown ?? controlButtons ?? linkButton) ? true : false
  return (
    <div className={`flex flex-col hover:bg-slate-100 ${isShowSubRow ? "bg-slate-100" : " "}  `}>
      <div
        className={`flex flex-col sm:flex-row ${className ? className : ""}  ${groupStyle ? groupStyle : "group"}`}  >
        <div className=' grow shrink'>
          {rowMain}
        </div>
        {enableControlDiv && (<div className='flex gap-x-4 ml-auto self-center mt-4 mb-2 sm:mt-0 sm:mb-0'>
          {(linkButton) ? (
            <a href={linkButton.link} className={`flex  sm:invisible items-center gap-x-2 px-3 py-2 rounded-md  border border-wri-gold bg-white font-semibold text-[15px] group-hover:visible ${groupStyle ? groupStyle : "group-hover:visible "} `}>
              <span>{linkButton.label}</span>
              <EyeIcon className="h-6 w-6 text-black " />
            </a>
          ) : ""}
          {(controlButtons) ? controlButtons.map((button, index) => {
            return (
              <button
                key={index}
                onClick={button.onClick}
                className={`my-auto flex sm:invisible  items-center justify-center  ${groupStyle ? groupStyle : "group-hover:visible "}  w-8 h-8 rounded-full  ${button?.color ? button.color : index == 1 ? "bg-wri-gold" : " bg-red-600"}`}
              >
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
        </div>)}
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
