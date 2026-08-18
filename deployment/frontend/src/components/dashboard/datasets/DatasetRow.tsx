import React from 'react';
import { ArrowPathIcon, StarIcon } from '@heroicons/react/24/outline';
import Row from '../_shared/Row';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { WriDataset } from '@/schema/ckan.schema';
import { formatDate } from '@/utils/general';
import { useRouter } from 'next/router';
import { DefaultTooltip } from '@/components/_shared/Tooltip';
import { visibilityTypeLabels } from '@/utils/constants';
import Chip from '@/components/_shared/Chip';
import PendingApprovalTag from '@/components/_shared/PendingApprovalTag';

function datasetTypeLabel(value?: string) {
  if (!value) return value;

  const labels: Record<string, string> = {
    raster_data: 'Raster data',
    tiled_raster_data: 'Tiled raster data',
    vector_data: 'Vector data',
    tiled_vector_data: 'Tiled vector data',
    tabular_data: 'Tabular data',
    versioned_tabular_data: 'Versioned tabular data',
    packaged_dataset: 'Packaged dataset',
    mixed_dataset: 'Mixed dataset',
    documentation: 'Documentation',
    model_output: 'Model output',
    api_dataset: 'API dataset',
  };

  return labels[value] ?? value;
}

function subFields(dataset: WriDataset) {
  return [
    {
      title: 'Coverage Start',
      description: dataset?.temporal_coverage_start,
    },
    {
      title: 'Coverage End',
      description: dataset?.temporal_coverage_end,
    },
    {
      title: 'Short description',
      description: dataset?.short_description,
    },
    {
      title: 'Technical Notes',
      description: dataset?.technical_notes,
    },
    {
      title: 'Team',
      description: dataset?.organization?.title,
    },
    {
      title: 'Dataset Type',
      description: datasetTypeLabel(dataset?.dataset_type_info),
    },
    {
      title: 'Release Notes',
      description: dataset?.release_notes,
      isHtml: true,
    },
  ];
}

function ApprovalDatasetCardProfile({ dataset }: { dataset: WriDataset }) {
  const created = dataset?.metadata_modified ? dataset.metadata_modified : '';

  return (
    <div className="flex  py-3 rounded-md pl-4 sm:pl-14 gap-x-2">
      {dataset.approval_status === 'pending' ? (
        <DefaultTooltip content="pending" side="bottom">
          <div className="w-2 h-2 rounded-full bg-wri-gold my-auto "></div>
        </DefaultTooltip>
      ) : dataset.approval_status === 'rejected' ? (
        <DefaultTooltip content="rejected" side="bottom">
          <div className="w-2 h-2 rounded-full bg-red-700 my-auto "></div>
        </DefaultTooltip>
      ) : (
        ''
      )}
      <div className="flex flex-col w-full">
        <p className="font-semibold text-[15px]">
          {dataset?.title ?? dataset?.name}
        </p>
        <div className="flex font-normal">
          <ArrowPathIcon className="w-3 h-3  text-[#3654A5] mt-[2px]" />
          <div className="ml-1 w-fit h-[12px] text-[12px] text-[#666666]">
            {formatDate(created)}
          </div>
        </div>
      </div>
    </div>
  );
}

function DatasetCardProfile({ dataset }: { dataset: WriDataset }) {
  const created = dataset?.metadata_modified ? dataset.metadata_modified : '';

  return (
    <div className="flex  py-3 rounded-md pl-4 sm:pl-14 gap-x-2">
      <div className="flex flex-col w-full">
        <p className="flex font-semibold text-[15px]">
          {dataset?.title ?? dataset?.name}
          {dataset.visibility_type &&
            dataset.visibility_type != 'public' && (
              <Chip
                text={
                  visibilityTypeLabels[
                  dataset.visibility_type
                  ] ?? ''
                }
              />
            )}
          <PendingApprovalTag dataset={dataset} />
        </p>
        <div className="flex font-normal">
          <ArrowPathIcon className="w-3 h-3  text-[#3654A5] mt-[2px]" />
          <div className="ml-1 w-fit h-[12px] text-[12px] text-[#666666]">
            {formatDate(created)}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubCardProfile({ dataset }: { dataset: WriDataset }) {
  const status = subFields(dataset);
  return (
    <div>
      <div className="ml-14  w-[90%] outline outline-1 outline-wri-gray"></div>
      <div className="grid grid-cols-2 grid-rows-4 sm:grid-cols-4 sm:grid-rows-2 gap-x-5 gap-y-2 sm:gap-y-0 px-2 pt-4  sm:pl-14 sm:pr-20 sm:pt-4">
        {status.map((item, index) => {
          return (
            <div key={index} className="flex flex-col">
              <p className="font-semibold text-[15px]">
                {item.title}
              </p>
              <p className="font-normal text-[14px] text-[#4B4B4B]">
                {!item.isHtml ? (
                  item.description
                ) : (
                  <div
                    className="prose max-w-none prose-sm pr-8 text-justify prose-a:text-wri-green"
                    dangerouslySetInnerHTML={{
                      __html: item?.description ?? '',
                    }}
                  ></div>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DatasetRow({
  className,
  dataset,
  handleOpenModal,
  authorized,
}: {
  className?: string;
  dataset: WriDataset;
  authorized?: boolean;
  handleOpenModal: (dataset: WriDataset) => void;
}) {
  const router = useRouter();
  return (
    <Row
      authorized={authorized}
      className={`pr-2 sm:pr-4 ${className ? className : ''}`}
      rowMain={<DatasetCardProfile dataset={dataset} />}
      controlButtons={[
        {
          label: 'Edit',
          color: 'bg-wri-gold hover:bg-yellow-400',
          icon: <PencilSquareIcon className="w-4 h-4 text-white" />,
          tooltip: {
            id: `edit-tooltip-${dataset.name}`,
            content: 'Edit Dataset',
          },
          onClick: () => {
            router.push(`/dashboard/datasets/${dataset.name}/edit`);
          },
        },
        {
          label: 'Delete',
          color: 'bg-red-600 hover:bg-red-500',
          icon: <TrashIcon className="w-4 h-4 text-white" />,
          tooltip: {
            id: `delete-tooltip-${dataset.name}`,
            content: 'Delete Dataset',
          },
          onClick: () => handleOpenModal(dataset),
        },
      ]}
      linkButton={{
        label: 'View Dataset',
        link: `../datasets/${dataset.name}`,
      }}
      rowSub={<SubCardProfile dataset={dataset} />}
      isDropDown
    />
  );
}

export function ApprovalDatasetRow({
  className,
  dataset,
  handleOpenModal,
  authorized,
}: {
  className?: string;
  dataset: WriDataset;
  authorized?: boolean;
  handleOpenModal: (dataset: WriDataset) => void;
}) {
  const router = useRouter();
  return (
    <Row
      authorized={authorized}
      className={`pr-2 sm:pr-4 ${className ? className : ''}`}
      rowMain={<ApprovalDatasetCardProfile dataset={dataset} />}
      controlButtons={[
        {
          label: 'Edit',
          color: 'bg-wri-gold hover:bg-yellow-400',
          icon: <PencilSquareIcon className="w-4 h-4 text-white" />,
          tooltip: {
            id: `edit-tooltip-${dataset.name}`,
            content: 'Edit Dataset',
          },
          onClick: () => {
            router.push(`/dashboard/datasets/${dataset.name}/edit`);
          },
        },
        {
          label: 'Delete',
          color: 'bg-red-600 hover:bg-red-500',
          icon: <TrashIcon className="w-4 h-4 text-white" />,
          tooltip: {
            id: `delete-tooltip-${dataset.name}`,
            content: 'Delete Dataset',
          },
          onClick: () => handleOpenModal(dataset),
        },
      ]}
      linkButton={{
        label: 'View Issues',
        link: `../datasets/${dataset.name}?tab=issues`,
      }}
      rowSub={<SubCardProfile dataset={dataset} />}
      isDropDown
    />
  );
}

export function FavouriteRow({
  className,
  dataset,
  handleOpenModal,
}: {
  className?: string;
  dataset: WriDataset;
  handleOpenModal: (dataset: WriDataset) => void;
}) {
  return (
    <Row
      className={`pr-2 sm:pr-4  ${className ? className : ''}`}
      rowMain={<DatasetCardProfile dataset={dataset} />}
      linkButton={{
        label: 'View Dataset',
        link: `../datasets/${dataset.name}`,
      }}
      controlButtons={[
        {
          label: 'Remove from favourites',
          color: 'bg-red-600 hover:bg-red-500',
          icon: (
            <StarIcon className="cursor-pointer h-4 w-4 text-white" />
          ),
          tooltip: {
            id: `delete-tooltip-${dataset.name}`,
            content: 'Remove from favourites',
          },
          onClick: () => handleOpenModal(dataset),
        },
      ]}
      rowSub={<SubCardProfile dataset={dataset} />}
      isDropDown
    />
  );
}

export function DraftRow({
  className,
  dataset,
  handleOpenModal,
}: {
  className?: string;
  dataset: WriDataset;
  handleOpenModal: (dataset: WriDataset) => void;
}) {
  const router = useRouter();
  return (
    <Row
      authorized={true}
      className={`pr-2 sm:pr-4 ${className ? className : ''}`}
      rowMain={<DatasetCardProfile dataset={dataset} />}
      controlButtons={[
        {
          label: 'Edit',
          color: 'bg-wri-gold hover:bg-green-400',
          icon: <PencilSquareIcon className="w-4 h-4 text-white" />,
          tooltip: {
            id: `delete-tooltip-${dataset.name}`,
            content: 'Edit Dataset',
          },
          onClick: () => {
            router.push(`/dashboard/datasets/${dataset.name}/edit`);
          },
        },
        {
          label: 'Delete',
          color: 'bg-red-600 hover:bg-red-500',
          icon: <TrashIcon className="w-4 h-4 text-white" />,
          tooltip: {
            id: `delete-tooltip-${dataset.name}`,
            content: 'Delete Dataset',
          },
          onClick: () => handleOpenModal(dataset),
        },
      ]}
      rowSub={<SubCardProfile dataset={dataset} />}
      isDropDown
    />
  );
}
