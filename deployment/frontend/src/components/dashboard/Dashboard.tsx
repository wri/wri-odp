import React, { useState, useEffect } from "react";
import { ReactSortable } from "react-sortablejs";
import QuickAction from "./QuickAction";
import Favourites from "./Favourites";
import Notifications from "./Notifications";
import UserActivityStreams from "./ActivityStreams";
import { Cog8ToothIcon, CheckIcon } from "@heroicons/react/24/outline";
import { api } from '@/utils/api';
import { DefaultTooltip } from "../_shared/Tooltip";


interface StateItem {
  id: number;
  name: string;
}

export default function Dashboard() {
  const localStorageKey = 'myState';
  const [state, setState] = useState<StateItem[]>([]);

  useEffect(() => {
    if (window !== undefined) {
      const storedState = localStorage.getItem(localStorageKey);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (storedState) {
        setState(JSON.parse(storedState) as StateItem[]);
      }
      else {
        setState([
          { id: 1, name: "quickAction" },
          { id: 2, name: "favourites" },
          { id: 3, name: "notifications" },
          { id: 4, name: "userActivityStreams" }
        ]);
      }

    }
  }, []);

  const [drag, setDrag] = useState({
    sortable: false,
    draggable: "false"
  });

  const saveState = (drag: { sortable: boolean, draggable: string }) => {
    setDrag({
      sortable: !drag.sortable,
      draggable: drag.sortable ? "true" : "false"
    });
    localStorage.setItem(localStorageKey, JSON.stringify(state));
  }

  return (
    <div className="relative max-w-8xl mx-auto w-full py-12 px-4 sm:px-6 lg:px-8">
      {
        drag.sortable ? (
          <DefaultTooltip content='save'>
            <button aria-label="setting" className="absolute sm:top-[46%] right-0 p-4 rounded-full shadow-wri bg-white z-30"
              onClick={() => {
                saveState(drag);
              }}
            >
              <CheckIcon className="w-8 h-8 text-wri-black" />
            </button>
          </DefaultTooltip>
        ) : (
          <DefaultTooltip content='edit'>
            <button aria-label="checked" className="absolute sm:top-[46%] right-0  p-4 rounded-full shadow-wri bg-white z-30"
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
          </DefaultTooltip>
        )
      }


      <ReactSortable list={state} setList={setState} className={`w-[90%] mx-auto sm:w-full h-full grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-6 xxl:gap-6 ${drag.sortable ? "grid" : "hidden"}`} sort={true} style={{ zIndex: 9999 }}>
        {state.map((item) => (
          <div key={item.id} className="w-full sm:h-[463px] relative">
            <SelectComponent name={item.name} drag={true} key={item.name} />
          </div>
        ))}
      </ReactSortable>

      <div className={`w-[90%] mx-auto sm:w-full h-full grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-6 xxl:gap-6 ${drag.sortable ? "hidden" : "grid"}`} >
        {state.map((item) => (
          <div key={item.id} className="  w-full sm:h-[463px] relative">
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
