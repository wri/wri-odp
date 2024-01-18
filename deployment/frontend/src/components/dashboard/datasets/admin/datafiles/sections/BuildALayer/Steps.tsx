import { useFormContext } from "react-hook-form"
import { LayerFormType } from "./layer.schema"
import classNames from "@/utils/classnames"

export function Steps({ state }: { state: string }) {
    const { watch } = useFormContext<LayerFormType>() // retrieve those props
    const steps = [
        { name: 'General Config', state: 'setSourceConfig', enabled: true },
        {
            name: 'Render',
            state: 'setRenderConfig',
            enabled: watch('layerConfig.source.provider.type')?.value === 'carto',
        },
        { name: 'Legend', state: 'setLegendConfig', enabled: true },
        { name: 'Interaction', state: 'setInteractionConfig', enabled: true },
    ]

    return (
        <>
            <div className="lg:hidden px-4 pt-4 sm:px-6 lg:px-8">
                <nav className="flex justify-start" aria-label="Progress">
                    <ol role="list" className="space-y-6">
                        {steps
                            .filter((step) => step.enabled)
                            .map((step) => (
                                <li key={step.name}>
                                    {step.state === state ? (
                                        <span
                                            className="flex items-start"
                                            aria-current="step"
                                        >
                                            <span
                                                className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center"
                                                aria-hidden="true"
                                            >
                                                <span className="absolute h-4 w-4 rounded-full bg-blue-200" />
                                                <span className="relative block h-2 w-2 rounded-full bg-blue-800" />
                                            </span>
                                            <span className="ml-3 text-sm font-medium text-blue-800">
                                                {step.name}
                                            </span>
                                        </span>
                                    ) : (
                                        <span className="group">
                                            <div className="flex items-start">
                                                <div
                                                    className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center"
                                                    aria-hidden="true"
                                                >
                                                    <div className="h-2 w-2 rounded-full bg-gray-300 group-hover:bg-gray-400" />
                                                </div>
                                                <p className="ml-3 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                                                    {step.name}
                                                </p>
                                            </div>
                                        </span>
                                    )}
                                </li>
                            ))}
                    </ol>
                </nav>
            </div>
            <nav aria-label="Progress" className="w-full hidden lg:block">
                <ol
                    role="list"
                    className="flex w-full items-center justify-between"
                >
                    {steps
                        .filter((step) => step.enabled)
                        .map((step, stepIdx) => (
                            <li
                                key={step.name}
                                className={classNames(
                                    stepIdx !== steps.length - 1
                                        ? 'w-full pr-8 sm:pr-20'
                                        : '',
                                    'relative isolate'
                                )}
                            >
                                {step.state === state ? (
                                    <>
                                        <div
                                            className="absolute inset-0 right-0 -z-10 flex items-center justify-end"
                                            aria-hidden="true"
                                        >
                                            <div className="h-0.5 w-[100%]  bg-blue-800" />
                                        </div>
                                        <div
                                            className={classNames(
                                                'flex w-fit items-center gap-x-2 bg-white',
                                                stepIdx === steps.length - 1
                                                    ? 'justify-end'
                                                    : ''
                                            )}
                                        >
                                            <div
                                                className={classNames(
                                                    stepIdx !== 0 ? 'pl-4' : '',
                                                    'bg-white'
                                                )}
                                            >
                                                <span
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-800"
                                                    aria-current="step"
                                                >
                                                    <span className="font-acumin text-lg font-normal text-white">
                                                        {stepIdx + 1}
                                                    </span>
                                                </span>
                                            </div>
                                            <span
                                                className={classNames(
                                                    'bg-white font-acumin text-base font-normal text-black',
                                                    stepIdx !== steps.length - 1
                                                        ? 'pr-4'
                                                        : ''
                                                )}
                                            >
                                                {step.name}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {stepIdx !== steps.length - 1 && (
                                            <div
                                                className="absolute inset-0 right-0 -z-10 flex w-full items-center justify-end"
                                                aria-hidden="true"
                                            >
                                                <div className="h-0.5 w-[100%] bg-neutral-100" />
                                            </div>
                                        )}
                                        <div
                                            className={classNames(
                                                'flex w-fit items-center gap-x-2 bg-white',
                                                stepIdx === steps.length - 1
                                                    ? 'justify-end'
                                                    : ''
                                            )}
                                        >
                                            <div
                                                className={classNames(
                                                    stepIdx !== 0 ? 'pl-4' : '',
                                                    'bg-white'
                                                )}
                                            >
                                                <span className="group flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
                                                    <span className="font-acumin text-lg font-normal text-neutral-400">
                                                        {stepIdx + 1}
                                                    </span>
                                                </span>
                                            </div>
                                            <span
                                                className={classNames(
                                                    'bg-white font-acumin text-base font-normal text-zinc-400',
                                                    stepIdx !== steps.length - 1
                                                        ? 'pr-6'
                                                        : ''
                                                )}
                                            >
                                                {step.name}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                </ol>
            </nav>
        </>
    )
}
