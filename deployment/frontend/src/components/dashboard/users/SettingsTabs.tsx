import { Tab } from '@headlessui/react'

const tabs = [
    {
        id: 'edit',
        title: 'User Preferences',
    },
    {
        id: 'apiTokens',
        title: 'API Tokens',
    },
]

export function SettingsTabs() {
    return (
        <>
            {tabs.map((tab) => (
                <Tab
                    as="div"
                    key={tab.title}
                    className="text-base font-normal text-black accent-white cursor-pointer w-full"
                >
                    {({ selected }) => (
                        <div
                            className={`w-full border-b-2 py-4 font-normal focus:outline-0 flex justify-center ${
                                selected
                                    ? ' border-b-2 border-b-wri-dark-green text-wri-green'
                                    : ''
                            } `}
                        >
                            <span className="text-center px-6 sm:px-8 lg:px-12 2xl:px-14">
                                {tab.title}
                            </span>
                        </div>
                    )}
                </Tab>
            ))}
        </>
    )
}
