import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Map } from "react-map-gl";
import GeocoderControl from "./GeocoderControl";

export default function LocationSearch() {
  return (
    <Disclosure as="div" className="border-b border-r border-stone-200 shadow">
      {({ open }) => (
        <>
          <Disclosure.Button className="flex h-16 w-full items-center gap-x-2 bg-white px-7 py-6">
            <div className="flex h-16 w-full items-center gap-x-2">
              <p className="font-['Acumin Pro SemiCondensed'] text-base font-normal text-black">
                Location
              </p>
            </div>
            <ChevronDownIcon
              className={`${
                open ? "rotate-180 transform" : ""
              } h-5 w-5 text-black`}
            />
          </Disclosure.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="h-[300px] border-t-2 border-amber-400 ">
              <Map
                mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjajFlcXZhNzcwMDBqMzNzMTQ0bDN6Y3U4In0.FRcIP_yusVaAy0mwAX1B8w"
                style={{ height: 300 }}
                mapStyle="mapbox://styles/mapbox/streets-v9"
              >
                <GeocoderControl
                  mapboxAccessToken="pk.eyJ1IjoicmVzb3VyY2V3YXRjaCIsImEiOiJjajFlcXZhNzcwMDBqMzNzMTQ0bDN6Y3U4In0.FRcIP_yusVaAy0mwAX1B8w"
                  position="bottom-right"
                />
              </Map>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}
