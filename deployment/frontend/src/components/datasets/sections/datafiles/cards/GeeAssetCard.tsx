import { Button } from '@/components/_shared/Button';
import classNames from '@/utils/classnames';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import {
  ArrowPathIcon,
  DocumentDuplicateIcon,
  FingerPrintIcon,
} from '@heroicons/react/24/outline';
import { type Resource } from '@/interfaces/dataset.interface';
import { getFormatColor } from '@/utils/formatColors';
import { useState } from 'react';
import { type WriDataset } from '@/schema/ckan.schema';
import DefaultTooltip from '@/components/_shared/Tooltip';
import { QueryEndpoint } from '../../APIEndpoint';

export function GeeAssetCard({
  datafile,
  dataset,
  diffFields,
  isCurrentVersion,
  index,
}: {
  datafile: Resource;
  dataset: WriDataset;
  isCurrentVersion?: boolean;
  diffFields: Array<Record<string, { old_value: string; new_value: string }>>;
  index: number;
}) {
  const created_at = new Date(datafile?.created ?? '');
  const last_updated = new Date(datafile?.metadata_modified ?? '');
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  } as const;

  const higlighted = (field: string, value: string) => {
    if (diffFields && !isCurrentVersion) {
      if (
        diffFields.some(
          (diffField) =>
            diffField[field] &&
            diffField[field]?.new_value === value
        )
      ) {
        return 'bg-yellow-200';
      }
    }
    return '';
  };
  const newDatafile = () => {
    if (diffFields && !isCurrentVersion) {
      if (
        diffFields[index] &&
        diffFields[index]?.undefined?.old_value === null
      ) {
        return 'bg-yellow-200';
      }
    }
    return '';
  };

  const CopyButton = ({ content }: { content: string }) => {
    const [copied, setCopied] = useState(false);
    const handleClick = () => {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };
    return (
      <DefaultTooltip
        content={copied ? 'Asset ID copied!' : 'Copy Asset ID'}
        contentClassName={`${copied ? 'bg-wri-green text-white' : ''}`}
        delayDuration={copied ? 0 : 100}
        onOpenChange={(open) => {
          if (copied && open) return;
        }}
        open={copied ? true : undefined}
      >
        <Button
          aria-label="copy button"
          className={`h-auto rounded-full p-2`}
          onClick={handleClick}
        >
          <DocumentDuplicateIcon className="w-3 text-white" />
        </Button>
      </DefaultTooltip>
    );
  };
  return (
    <Disclosure>
      {({ open }) => (
        <div
          className={classNames(
            'flex flex-col gap-y-2 border-b-2 border-green-700 p-5 shadow transition hover:bg-slate-100',
            open ? 'bg-slate-100' : '',
            newDatafile()
          )}
        >
          <div
            className={classNames(
              'flex flex-row items-center justify-between',
              open ? 'border-b border-neutral-400 pb-2' : ''
            )}
          >
            <div className="flex items-center gap-3">
              <DefaultTooltip content="Not selectable for direct download">
                <input
                  aria-label={`Select ${datafile.title}`}
                  type="checkbox"
                  className="h-4 w-4  rounded  bg-gray-200 border-gray-300"
                  disabled
                  checked={false}
                />
              </DefaultTooltip>
              {datafile?.asset_type && (
                <span
                  className={classNames(
                    'hidden h-7 w-fit items-center justify-center rounded-sm px-3 text-center text-xs font-normal text-black md:flex',
                    getFormatColor(
                      datafile?.asset_type ?? ''
                    )
                  )}
                >
                  <span className="my-auto capitalize">
                    {datafile.asset_type}
                  </span>
                </span>
              )}
              <Disclosure.Button>
                <h3
                  className={`font-acumin sm:text-sm xl:text-lg font-semibold text-stone-900 ${datafile.title
                      ? higlighted(
                        'title',
                        datafile.title
                      )
                      : higlighted('name', datafile.name!)
                    }`}
                >
                  {datafile.title ?? datafile.name}
                </h3>
              </Disclosure.Button>
            </div>
            <div className="gap-x-2 hidden sm:flex">
              <Disclosure.Button
                role="button"
                aria-label="expand"
              >
                <ChevronDownIcon
                  className={`${open
                      ? 'rotate-180 transform  transition'
                      : ''
                    } h-5 w-5 text-stone-900`}
                />
              </Disclosure.Button>
            </div>
          </div>
          <Transition
           as="div"
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="py-3">
              <p
                className={`font-acumin text-base font-light text-stone-900 ${datafile.description
                    ? higlighted(
                      'description',
                      datafile.description
                    )
                    : ''
                  }`}
              >
                {datafile.description ?? 'No Description'}
              </p>
              <div className="mt-[0.33rem] flex justify-start gap-x-3">
                <div className="flex flex-row items-center gap-x-1">
                  <FingerPrintIcon className="h-3 w-3 text-blue-800" />
                  <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                    {created_at.toLocaleDateString(
                      'en-US',
                      options
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-x-1">
                  <ArrowPathIcon className="h-3 w-3 text-blue-800" />
                  <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                    {last_updated.toLocaleDateString(
                      'en-US',
                      options
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <QueryEndpoint
                  description="Copy the Google Earth Engine snippet for use in the Earth Engine Code Editor."
                  url={datafile.asset_id ?? ''}
                  method={''}
                  copyButton={
                    <CopyButton
                      content={datafile.asset_id ?? ''}
                    />
                  }
                />
              </div>
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  );
}
