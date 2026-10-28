import { useRouter } from 'next/router';
import Link from 'next/link';
import { Navbar, Search, Button } from '@worldresources/wri-design-systems';
import { useState, type FormEvent } from 'react';
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
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const value = searchValue.trim();
        setIsSearchOpen(false);
        setSearchValue('');

        if (!value) {
            void router.push('/search');
            return;
        }

        void router.push({
            pathname: '/search',
            query: `search=${encodeURIComponent(
                JSON.stringify([{ title: 'Search', key: 'search', label: value, value }])
            )}`,
        });
    };

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
                        link: '/search',
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
                    isSearchOpen ? (
                        <form key="search" onSubmit={handleSearch}>
                            <Search
                                autoFocus
                                placeholder="Search datasets"
                                options={[]}
                                displayResults="none"
                                onQueryChange={setSearchValue}
                                onClear={() => setSearchValue('')}
                            />
                        </form>
                    ) : (
                        <Button
                            key="search"
                            variant="borderless"
                            size="default"
                            aria-label="Search"
                            leftIcon={
                                <MagnifyingGlassIcon
                                    aria-hidden="true"
                                    focusable="false"
                                    width={15}
                                    height={15}
                                />
                            }
                            onClick={() => setIsSearchOpen(true)}
                        >
                            Search
                        </Button>
                    ),
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
