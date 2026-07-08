import WriLogo from '@/components/icons/WriLogo';

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
            <WriLogo />
            <span>Hosted by WRI</span>
        </div>
    );
}
