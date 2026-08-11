import { useState } from 'react';
import type { MapRef } from 'react-map-gl';
import { Button, getThemedSpacing } from '@worldresources/wri-design-systems';
import { MapPinIcon } from '@heroicons/react/24/solid';

export default function YourLocationButton({ mapRef }: { mapRef: React.RefObject<MapRef | null> }) {
    const [loading, setLoading] = useState(false);

    const handleClick = () => {
        setLoading(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                mapRef.current?.flyTo({
                    center: [longitude, latitude],
                    zoom: 12,
                    duration: 1500,
                });

                setLoading(false);
            },
            (error) => {
                console.error(error);
                setLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    if (!navigator.geolocation) {
        return null;
    }

    return (
        <div style={{ position: 'absolute', bottom: 0, right: 0, padding: getThemedSpacing(400) }}>
            <Button
                onClick={handleClick}
                disabled={loading}
                leftIcon={<MapPinIcon className="h-5 w-5" />}
                variant="secondary"
            >
                Your location
            </Button>
        </div>
    );
}
