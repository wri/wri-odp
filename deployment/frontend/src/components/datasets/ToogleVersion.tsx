import { useState } from 'react'
import { Switch } from '@headlessui/react'
import { DefaultTooltip } from '../_shared/Tooltip'
import classNames from '@/utils/classnames'

export default function ToggleVersion({
    enabled,
    setEnabled,
    approval_status,
    is_approved,
}: {
    enabled: boolean
    approval_status: string
    is_approved: boolean
    setEnabled: (enabled: boolean) => void
}) {
    return (
        <Switch.Group
            as="div"
            className="flex items-center gap-x-2 font-acumin mr-1"
        >
            <Switch
                id="toggle-version"
                aria-label={
                    enabled
                        ? `Toggle to see ${
                              approval_status === 'pending'
                                  ? 'pending'
                                  : 'rejected'
                          } version`
                        : `Toggle to see ${
                              is_approved ? 'approved' : 'early'
                          } version`
                }
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
            <span className="text-sm mt-1">
                {enabled
                    ? `Toggle to see ${
                          approval_status === 'pending' ? 'pending' : 'rejected'
                      } version`
                    : `Toggle to see ${
                          is_approved ? 'approved' : 'early'
                      } version`}
            </span>
        </Switch.Group>
    )
}
