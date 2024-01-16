import { useState } from 'react'
import { Switch } from '@headlessui/react'
import { DefaultTooltip } from '../_shared/Tooltip'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function ToggleVersion({
    enabled,
    setEnabled,
}: {
    enabled: boolean
    setEnabled: (enabled: boolean) => void
}) {
    return (
        <Switch.Group
            as="div"
            className="flex items-center gap-x-4 font-acumin mr-1"
        >
            <DefaultTooltip
                content={`
            ${
                enabled
                    ? 'toggle to see current version'
                    : 'toggle to see previous version'
            }`}
                side="bottom"
            >
                <Switch
                    checked={enabled}
                    onChange={setEnabled}
                    className={classNames(
                        enabled ? 'bg-indigo-600' : 'bg-gray-200',
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'
                    )}
                >
                    <span
                        aria-hidden="true"
                        className={classNames(
                            enabled ? 'translate-x-5' : 'translate-x-0',
                            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                        )}
                    />
                </Switch>
            </DefaultTooltip>
        </Switch.Group>
    )
}
