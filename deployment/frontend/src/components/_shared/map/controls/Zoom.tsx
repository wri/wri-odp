import { MutableRefObject } from "react";
import IconButton from "./IconButton";
import { MapRef } from "react-map-gl";

export default function Zoom({
    mapRef,
}: {
    mapRef: MutableRefObject<MapRef | null>;
}) {

    return <>
        <IconButton onClick={() => mapRef?.current?.zoomIn({ duration: 500 })}><PlusIcon /></IconButton>
        <IconButton onClick={() => mapRef?.current?.zoomOut({ duration: 500 })}><MinusIcon /></IconButton>
    </>
}

function PlusIcon() {
    return <svg width="15" height="15" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 1.36914V16.3691M16.5 8.86914H1.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
}

function MinusIcon() {
    return <svg width="15" height="2" viewBox="0 0 18 2" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.5 0.869141H1.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
}
