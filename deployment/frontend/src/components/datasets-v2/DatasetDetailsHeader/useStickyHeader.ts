import { useEffect, useRef, useState } from 'react';

export default function useStickyHeader() {
    const [isSticky, setIsSticky] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry) {
                    return;
                }

                setIsSticky(!entry.isIntersecting);
            },
            {
                threshold: 0,
            }
        );

        const element = headerRef.current;

        if (element) {
            observer.observe(element);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return {
        headerRef,
        isSticky,
    };
}
