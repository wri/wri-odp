import React, { useState } from "react";
import { ReactSortable } from "react-sortablejs";
import QuickAction from "./QuickAction";
import Favourites from "./Favourites";
import Notifications from "./Notifications";
import UserActivityStreams from "./ActivityStreams";
import { Cog8ToothIcon, CheckIcon } from "@heroicons/react/24/outline";
import { api } from '@/utils/api';


export default function Dashboard() {

  const [state, setState] = useState([
    { id: 1, name: "quickAction" },
    { id: 2, name: "favourites" },
    { id: 3, name: "notifications" },
    { id: 4, name: "userActivityStreams" }
  ]);


  const [drag, setDrag] = useState({
    sortable: false,
    draggable: "false"
  });

  return (
    <div className="relative max-w-8xl mx-auto w-full py-12 px-4 sm:px-6 lg:px-8">
      {
        drag.sortable ? (
          <button className="absolute sm:top-[46%] right-0 p-4 rounded-full shadow-wri bg-white z-30"
            onClick={() => {
              setDrag({
                sortable: !drag.sortable,
                draggable: drag.sortable ? "true" : "false"
              });
            }}
          >
            <CheckIcon className="w-8 h-8 text-wri-black" />
          </button>
        ) : (

          <button className="absolute sm:top-[46%] right-0  p-4 rounded-full shadow-wri bg-white z-30"
            onClick={
              () => {
                setDrag({
                  sortable: !drag.sortable,
                  draggable: drag.sortable ? "true" : "false"
                });
              }}
          >
            <Cog8ToothIcon className="w-8 h-8 text-wri-black" />
          </button>
        )
      }


      <ReactSortable list={state} setList={setState} className={`h-full grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-6 xxl:gap-6 ${drag.sortable ? "grid" : "hidden"}`} sort={true} style={{ zIndex: 9999 }}>
        {state.map((item) => (
          <div key={item.id} className="  w-full h-[463px] relative">
            <SelectComponent name={item.name} drag={true} key={item.name} />
          </div>
        ))}
      </ReactSortable>

      <div className={`h-full grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-6 xxl:gap-6 ${drag.sortable ? "hidden" : "grid"}`} >
        {state.map((item) => (
          <div key={item.id} className="  w-full h-[463px] relative">
            <SelectComponent name={item.name} drag={false} />
          </div>
        ))}
      </div>


    </div>

  )
}


function SelectComponent({ name, drag }: { name: string, drag: boolean }) {
  switch (name) {
    case "quickAction":
      return <QuickAction drag={drag} />
    case "favourites":
      return <Favourites drag={drag} />
    case "notifications":
      return <Notifications drag={drag} />
    case "userActivityStreams":
      return <UserActivityStreams drag={drag} />
    default:
      return <QuickAction drag={drag} />
  }
}