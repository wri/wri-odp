import React, { useState } from "react";
import { ReactSortable } from "react-sortablejs";
import QuickAction from "./QuickAction";
import Favourites from "./Favourites";
import Notifications from "./Notifications";
import UserActivityStreams from "./ActivityStreams";
import { Cog8ToothIcon, CheckIcon } from "@heroicons/react/24/outline";



export default function Dashboard() {
  const [state, setState] = useState([
    { id: 1, name: QuickAction },
    { id: 2, name: Favourites },
    { id: 3, name: Notifications },
    { id: 4, name: UserActivityStreams }
  ]);

  const [drag, setDrag] = useState({
    sortable: false,
    draggable: "false"
  });

  return (
    <div className="relative max-w-8xl mx-auto w-full py-12">
      {
        drag.sortable ? (
          <button className="absolute sm:top-[46%] right-0 sm:-right-6 p-4 rounded-full shadow-wri bg-white z-30"
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

          <button className="absolute sm:top-[46%] right-0 sm:-right-6 p-4 rounded-full shadow-wri bg-white z-30"
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
          <div key={item.id} className="  w-full h-[463px] relative">{(<item.name drag={true} />)}</div>
        ))}
      </ReactSortable>

      <div className={`h-full grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-6 xxl:gap-6 ${drag.sortable ? "hidden" : "grid"}`} >
        {state.map((item) => (
          <div key={item.id} className="  w-full h-[463px] relative">{(<item.name drag={false} />)}</div>
        ))}
      </div>


    </div>

  )
}
