import React, { useState } from 'react'
import { EyeIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react'
import classNames from '@/utils/classnames';
import { Tooltip } from 'react-tooltip'

type RowButton = {
  label?: string;
  icon?: React.ReactNode;
  color?: string;
  onClick: () => void;
  tooltip?: {
    id: string;
    content: string;
  }
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
    <div className={`flex flex-col hover:bg-wri-slate ${isShowSubRow ? "bg-wri-slate" : " "}  `}>
      <div
        className={`flex flex-col sm:flex-row   ${groupStyle ? groupStyle : "group"} ${classNames(isShowSubRow ? "bg-wri-slate pr-4" : className ? className : "")} `} >
        <div className=' grow shrink'>
          {rowMain}
        </div>
        {enableControlDiv && (<div className='flex gap-x-4 ml-auto self-center mt-4 mb-2 sm:mt-0 sm:mb-0'>
          {(linkButton) ? (
            <a href={linkButton.link} className={`flex  sm:invisible items-center gap-x-2 px-3 py-2 rounded-md  border border-wri-gold hover:bg-wri-gold bg-white font-semibold text-[15px] group-hover:visible ${groupStyle ? groupStyle : "group-hover:visible "} `}>
              <span>{linkButton.label}</span>
              <EyeIcon className="h-6 w-6 text-black " />
            </a>
          ) : ""}
          {(controlButtons) ? controlButtons.map((button, index) => {
            return (
              <>
                <button
                  data-tooltip-id={button?.tooltip ? button?.tooltip.id : "tooltip-id"}
                  data-tooltip-content={button?.tooltip ? button?.tooltip.content : "tooltip-content"}
                  data-tooltip-place="top"
                  key={index}
                  onClick={button.onClick}
                  className={`my-auto flex sm:invisible  items-center justify-center  ${groupStyle ? groupStyle : "group-hover:visible "}  w-8 h-8 rounded-full  ${button?.color ? button.color : index == 1 ? "bg-wri-gold" : " bg-red-600"}`}
                >
                  {(button.icon)}
                </button>
                <Tooltip id={button?.tooltip ? button?.tooltip.id : "tooltip-id"} />
              </>

            )
          }) : ""}

          {(isDropDown) ? (
            <button id="rowshow" className={`flex items-center gap-x-2 px-2 py-1 rounded-md`}
              onClick={() => setIsShowSubRow(!isShowSubRow)}
            >
              {isShowSubRow ? (<ChevronUpIcon className=' w-4 h-4 text-black' />) : (<ChevronDownIcon className=' w-4 h-4 text-black' />)}
            </button>
          ) : ""}
        </div>)}
      </div>
      <Transition
        show={isShowSubRow}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >

        <div id="sub-row">
          {(rowSub) ? rowSub : ""}
        </div>
      </Transition>
    </div>
  )
}
