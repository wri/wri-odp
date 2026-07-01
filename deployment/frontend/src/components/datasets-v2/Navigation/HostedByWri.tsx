import Image from 'next/image';

export default function NavigationHostedByWri() {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
            }}
        >
            <Image
                src="/images/wri_logo.svg"
                alt="WRI"
                width={20}
                height={20}
                priority
            />
            <span>Hosted by WRI</span>
        </div>
    );
}
