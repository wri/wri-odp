import { useRouter } from 'next/router';
import Link from 'next/link';
import { getThemedFontSize, Navbar, Search } from '@worldresources/wri-design-systems';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import NavigationLoginModal from './LoginModal';
import NavigationUserMenu from './UserMenu';
import NavigationHostedByWri from './HostedByWri';

export default function Navigation() {
    const router = useRouter();
    const { pathname } = router;
    const session = useSession();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Navbar
                linkRouter={Link}
                pathname={pathname}
                logo={
                    <Link href="/">
                        <span
                            style={{
                                fontWeight: 700,
                                fontSize: getThemedFontSize(600),
                            }}
                        >
                            Data explorer
                        </span>
                    </Link>
                }
                navigationSection={[
                    {
                        label: 'Topics',
                        link: '/topics',
                    },
                    {
                        label: 'Teams',
                        link: '/teams',
                    },
                    {
                        label: 'Applications',
                        link: '/applications',
                    },
                ]}
                utilitySection={[
                    <div key="search" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search
                            size="small"
                            options={[]}
                            placeholder="Search"
                            displayResults="none"
                            onQueryChange={() => {
                                console.log('Search query changed');
                            }}
                        />
                    </div>,
                    <NavigationHostedByWri key="wri-apps" />,
                    session.status === 'authenticated' ? (
                        <div key="user-menu">
                            <NavigationUserMenu />
                        </div>
                    ) : null,
                ]}
                actionsSection={
                    session.status === 'authenticated'
                        ? []
                        : [
                              {
                                  children: 'Sign in',
                                  ariaLabel: 'Sign in',
                                  size: 'small',
                                  onClick: () => setIsOpen(true),
                              },
                          ]
                }
                fixed
            />
            <NavigationLoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
