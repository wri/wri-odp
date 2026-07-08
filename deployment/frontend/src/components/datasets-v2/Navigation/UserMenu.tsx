import { UserCircleIcon } from '@heroicons/react/20/solid';
import { Menu } from '@worldresources/wri-design-systems';
import { signOut, useSession } from 'next-auth/react';

export default function NavigationUserMenu({
    colors = 'dark',
}: {
    colors?: 'dark' | 'light';
}) {
    const session = useSession();

    const items = [
        {
            label: 'Dashboard',
            value: 'dashboard',
            link: '/dashboard',
        },
        {
            label: 'Settings',
            value: 'settings',
            link: `/dashboard/settings/edit/${session.data?.user.name}`,
        },
        {
            label: 'Log Out',
            value: 'logout',
            onClick: async () => {
                try {
                    await fetch(
                        `${process.env.NEXT_PUBLIC_CKAN_URL}/api/3/action/user_logout`,
                        {
                            method: 'POST',
                            body: new URLSearchParams({
                                id: session.data?.user.id!,
                            }),
                        }
                    );
                } catch (error) {
                    console.error(
                        'Failed to logout from CKAN backend. The current token will not be revoked until next login.'
                    );
                    console.error(error);
                }
                signOut({ redirect: true, callbackUrl: window.location.href });
            },
        },
    ];

    return (
        <div
            className="text-right -ml-6 sm:ml-0 font-acumin"
            id="nav-user-menu"
        >
            <Menu
                label={session.data?.user.name ?? 'User menu'}
                items={items}
                hideArrow
                customTrigger={
                    <div className="flex cursor-pointer items-center">
                        <UserCircleIcon
                            className={`text-black h-5 w-5 mr-2 ${
                                colors === 'light' ? '!text-white' : ''
                            }`}
                        />
                        <div
                            className={`font-normal text-sm sm:text-lg border-b-2 border-b-wri-gold ${
                                colors === 'light' ? '!text-white' : ''
                            }`}
                        >
                            {session.data?.user.name}
                        </div>
                    </div>
                }
            />
        </div>
    );
}
