import { useRouter } from 'next/router';
import Link from 'next/link';
import { getThemedFontSize, Navbar } from '@worldresources/wri-design-systems';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import NavigationLoginModal from './LoginModal';
import NavigationUserMenu from './UserMenu';
import WriLogo from '@/components/icons/WriLogo';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
                    <Link href="/search" key="search">
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <MagnifyingGlassIcon aria-hidden="true" focusable="false" width={15} height={15} />
                    </Link>,
                    <div
                        key="wri-apps"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <WriLogo aria-hidden="true" focusable="false" />
                    </div>,
                    ...(session.status === 'authenticated'
                        ? [
                              <div key="user-menu">
                                  <NavigationUserMenu />
                              </div>,
                          ]
                        : []),
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
