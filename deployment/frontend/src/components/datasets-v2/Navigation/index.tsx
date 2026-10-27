import { useRouter } from 'next/router';
import Link from 'next/link';
import { Navbar } from '@worldresources/wri-design-systems';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import LoginModal from '@/components/_shared/LoginModal';
import NavigationUserMenu from './UserMenu';
import WriLogo from '@/components/icons/WriLogo';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

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
                onNavbarHeightChange={(height) => {
                    document.documentElement.style.setProperty(
                        '--dataset-v2-navbar-height',
                        `${height}px`
                    );
                }}
                logo={
                    <Link href="/">
                        <Image
                            src="/images/WRI_logo_4c.png"
                            alt="Logo"
                            width={220}
                            height={250}
                            className="hidden sm:block"
                        />
                        <Image
                            src="/images/WRI_logo_4c.png"
                            alt="Logo"
                            width={150}
                            height={250}
                            className="block sm:hidden"
                        />
                    </Link>
                }
                navigationSection={[
                    {
                        label: 'Datasets',
                        link: '/datasets',
                    },
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
                            <MagnifyingGlassIcon
                                aria-hidden="true"
                                focusable="false"
                                width={15}
                                height={15}
                            />
                            <span>Search</span>
                        </div>
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
                        <span>Hosted by WRI</span>
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
            <LoginModal isOpen={isOpen} closeModal={() => setIsOpen(false)} />
        </>
    );
}
