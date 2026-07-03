import React, { useState } from 'react';
import SearchHeader from '../_shared/SearchHeader';
import RowProfile from '../_shared/RowProfile';
import Row from '../_shared/Row';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { IRowProfile } from '../_shared/RowProfile';
import { api } from '@/utils/api';
import Spinner from '@/components/_shared/Spinner';
import type { SearchInput } from '@/schema/search.schema';
import Pagination from '../_shared/Pagination';
import notify from '@/utils/notify';
import dynamic from 'next/dynamic';
const Modal = dynamic(() => import('@/components/_shared/Modal'), {
  ssr: false,
});
import { useRouter } from 'next/router';
import { LoaderButton, Button } from '@/components/_shared/Button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import type { GroupTree } from '@/schema/ckan.schema';
import { ArchiveBoxArrowDownIcon } from '@heroicons/react/24/solid';
import { ErrorAlert } from '@/components/_shared/Alerts';
import { visibilityTypeLabels } from '@/utils/constants';
import Chip from '../../_shared/Chip';

function downloadCsv(data: string, filename: string) {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });

  // Create a temporary URL for the Blob
  const url = window.URL.createObjectURL(blob);

  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);

  // Append link to body, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL
  window.URL.revokeObjectURL(url);
}

type IOrg = {
  title: string | undefined;
  name: string | undefined;
  image_display_url: string | undefined;
  description: string;
};

function TeamProfile({
  team,
  org2img,
}: {
  team: GroupTree;
  org2img: Record<string, string>;
}) {
  const description = team?.children?.length
    ? `${team?.children?.length} SubTeams`
    : 'No SubTeams';
  const TopicProfile = team as IRowProfile;
  TopicProfile.description = description;
  TopicProfile.image_display_url = org2img[team.id];
  return (
    <div className="flex py-5 pl-2">
      <RowProfile
        imgStyle="w-16 h-16 bg-[#F9F9F9] group-hover:bg-white"
        isPad
        profile={team}
        defaultImg="/images/placeholders/teams/teamdefault.png"
      />
      {team.visibility === 'private' && (
        <div className="ml-2 py-3">
          <Chip text={visibilityTypeLabels[team.visibility] ?? ''} />
        </div>
      )}
    </div>
  );
}

function SubTeamProfile({
  team,
  org2img,
}: {
  team: GroupTree;
  org2img: Record<string, string>;
}) {
  const description = team?.children?.length
    ? `${team?.children?.length} SubTeams`
    : 'No SubTeams';
  const TopicProfile = team as IRowProfile;
  TopicProfile.description = description;
  TopicProfile.image_display_url = org2img[team.id];
  return (
    <div className="flex py-5 pl-3 sm:pl-5">
      <RowProfile
        imgStyle="w-16 h-16 bg-[#F9F9F9] "
        isPad
        profile={team}
        defaultImg="/images/placeholders/teams/teamdefault.png"
      />
      {team.visibility === 'private' && (
        <div className="ml-2 py-3">
          <Chip text={visibilityTypeLabels[team.visibility] ?? ''} />
        </div>
      )}
    </div>
  );
}

function SubCardProfile({
  teams,
  highlighted,
  org2img,
}: {
  teams: IRowProfile[] | GroupTree[] | undefined;
  highlighted?: boolean;
  org2img: Record<string, string>;
}) {
  const utils = api.useUtils();
  const [open, setOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<GroupTree | null>(null);
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deleteTeam = api.teams.deleteDashboardTeam.useMutation({
    onSuccess: async (data) => {
      await utils.organization.getUsersOrganizations.invalidate();
      setOpen(false);
      notify(
        `Successfully deleted the ${selectedTeam?.title ?? selectedTeam?.name} Team`,
        'error'
      );
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });
  const getDownloadEvents = api.downloadEvents.getAllEvents.useMutation({
    onSuccess: async (data: string, variables) => {
      downloadCsv(data, `signups-${variables?.ownerOrg}.csv`);
    },
  });

  const handleOpenModal = (topic: GroupTree) => {
    setSelectedTeam(topic);
    setOpen(true);
  };

  const Team = (team: GroupTree) => {
    const TeamProfile = team as IRowProfile;
    TeamProfile.image_display_url = org2img[team.id];
    return TeamProfile;
  };

  if (!teams || teams.length === 0) return <></>;
  return (
    <div className="flex flex-col pt-2 pl-4">
      {teams.map((team, index) => {
        return (
          <div key={team.title}>
            {(team as GroupTree).children?.length ? (
              <>
                <Row
                  key={index}
                  highlighted={highlighted}
                  authorized={team?.capacity === 'admin'}
                  groupStyle="group/item group-hover/item:visible "
                  className={`pr-6 border-b-[1px] border-wri-gray hover:bg-[#DDEAEF] `}
                  rowMain={
                    <>
                      <SubTeamProfile
                        team={team as GroupTree}
                        org2img={org2img}
                      />
                      {team.visibility === 'private' && (
                        <div className="ml-2 py-3">
                          <Chip
                            text={
                              visibilityTypeLabels[
                              team.visibility
                              ] ?? ''
                            }
                          />
                        </div>
                      )}
                    </>
                  }
                  linkButton={{
                    label: 'View Team',
                    link: `../teams/${team.name}`,
                  }}
                  controlButtons={[
                    {
                      label: 'Edit',
                      color: 'bg-wri-gold hover:bg-yellow-500',
                      icon: (
                        <PencilSquareIcon className="w-4 h-4 text-white" />
                      ),
                      tooltip: {
                        id: `edit-tooltip-${team.name}`,
                        content: 'Edit Team',
                      },
                      onClick: () => {
                        router.push(
                          `/dashboard/teams/${team.name}/edit`
                        );
                      },
                    },
                    {
                      label: 'Delete',
                      color: 'bg-red-600 hover:bg-red-500',
                      icon: (
                        <TrashIcon className="w-4 h-4 text-white" />
                      ),
                      tooltip: {
                        id: `delete-tooltip-${team.name}`,
                        content: 'Delete Team',
                      },
                      onClick: () =>
                        handleOpenModal(
                          team as GroupTree
                        ),
                    },
                    {
                      label: 'Download signups',
                      color: 'bg-wri-gold hover:bg-yellow-500',
                      icon: (
                        <ArchiveBoxArrowDownIcon className="w-4 h-4 text-white" />
                      ),
                      tooltip: {
                        id: `download-events-tooltip-${team.name}`,
                        content: 'Get ',
                      },
                      onClick: () =>
                        getDownloadEvents.mutate({
                          ownerOrg: team.name,
                        }),
                    },
                  ]}
                  isDropDown
                  rowSub={
                    <SubCardProfile
                      teams={(team as GroupTree).children}
                      org2img={org2img}
                    />
                  }
                />
              </>
            ) : (
              <>
                <Row
                  key={index}
                  authorized={team?.capacity === 'admin'}
                  groupStyle="group/item group-hover/item:visible "
                  className={`pr-6 border-b-[1px] border-wri-gray hover:bg-[#DDEAEF]`}
                  rowMain={
                    <>
                      <div className="flex pl-4 sm:pl-6  ">
                        <RowProfile
                          imgStyle="w-8 h-8 mt-2"
                          isPad
                          profile={Team(
                            team as GroupTree
                          )}
                          defaultImg="/images/placeholders/teams/teamdefault.png"
                        />
                        {team.visibility ===
                          'private' && (
                            <div className="ml-2 py-3">
                              <Chip
                                text={
                                  visibilityTypeLabels[
                                  team
                                    .visibility
                                  ] ?? ''
                                }
                              />
                            </div>
                          )}
                      </div>
                    </>
                  }
                  linkButton={{
                    label: 'View Team',
                    link: `../teams/${team.name}`,
                  }}
                  controlButtons={[
                    {
                      label: 'Edit',
                      color: 'bg-wri-gold hover:bg-yellow-500',
                      icon: (
                        <PencilSquareIcon className="w-4 h-4 text-white" />
                      ),
                      tooltip: {
                        id: `edit-tooltip-${team.name}`,
                        content: 'Edit Team',
                      },
                      onClick: () => {
                        router.push(
                          `/dashboard/teams/${team.name}/edit`
                        );
                      },
                    },
                    {
                      label: 'Delete',
                      color: 'bg-red-600 hover:bg-red-500',
                      icon: (
                        <TrashIcon className="w-4 h-4 text-white" />
                      ),
                      tooltip: {
                        id: `delete-tooltip-${team.name}`,
                        content: 'Delete Team',
                      },
                      onClick: () =>
                        handleOpenModal(
                          team as GroupTree
                        ),
                    },
                    {
                      label: 'Download signups',
                      color: 'bg-wri-gold hover:bg-yellow-500',
                      icon: (
                        <ArchiveBoxArrowDownIcon className="w-4 h-4 text-white" />
                      ),
                      tooltip: {
                        id: `download-events-tooltip-${team.name}`,
                        content: 'Get ',
                      },
                      onClick: () =>
                        getDownloadEvents.mutate({
                          ownerOrg: team.name,
                        }),
                    },
                  ]}
                />
              </>
            )}
          </div>
        );
      })}
      {selectedTeam && (
        <Modal
          open={open}
          setOpen={setOpen}
          className="sm:w-full sm:max-w-lg"
        >
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationTriangleIcon
                className="h-6 w-6 text-red-600"
                aria-hidden="true"
              />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <Dialog.Title
                as="h3"
                className="text-base font-semibold leading-6 text-gray-900"
              >
                Delete Team
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this Team?
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
            <LoaderButton
              variant="destructive"
              loading={deleteTeam.isLoading}
              onClick={() => deleteTeam.mutate(selectedTeam.id)}
            >
              Delete Team
            </LoaderButton>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            {errorMessage ? (
              <ErrorAlert
                text={errorMessage}
                title="Delete Team failed"
              />
            ) : null}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function TeamCard() {
  const [query, setQuery] = useState<SearchInput>({
    search: '',
    page: { start: 0, rows: 10 },
  });
  const { data, isLoading, refetch } =
    api.organization.getUsersOrganizations.useQuery(query);
  const [selectedTeam, setSelectedTeam] = useState<GroupTree | null>(null);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const deleteTeam = api.teams.deleteDashboardTeam.useMutation({
    onSuccess: async (data) => {
      await refetch();
      setOpen(false);
      notify(
        `Successfully deleted the ${selectedTeam?.title ?? selectedTeam?.name} Team`,
        'error'
      );
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });
  const getDownloadEvents = api.downloadEvents.getAllEvents.useMutation({
    onSuccess: async (data, variables) => {
      downloadCsv(data, `signups-${variables?.ownerOrg}.csv`);
    },
  });

  const handleOpenModal = (team: GroupTree) => {
    setSelectedTeam(team);
    setOpen(true);
  };

  return (
    <section className="w-full max-w-8xl flex flex-col gap-y-4 sm:gap-y-0">
      <SearchHeader
        leftStyle=" px-2 sm:pr-2 sm:pl-12"
        rightStyle="pr-2 sm:pr-6"
        setQuery={setQuery}
        query={query}
        Pagination={
          <Pagination
            setQuery={setQuery}
            query={query}
            isLoading={isLoading}
            count={data?.count}
          />
        }
      />
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Spinner className="mx-auto my-2" />
        </div>
      ) : data?.organizations.length === 0 ? (
        <div className="flex justify-center items-center h-screen">
          No Organization
        </div>
      ) : (
        data?.organizations.map((team, index) => {
          const isPrivate = team?.visibility === 'private';
          return (
            <div key={team.name}>
              <Row
                key={index}
                className={`pr-2`}
                highlighted={team?.highlighted}
                authorized={team?.capacity === 'admin'}
                rowMain={
                  <TeamProfile
                    team={team}
                    org2img={data?.org2Image}
                  />
                }
                linkButton={{
                  label: 'View Team',
                  link: `../teams/${team.name}`,
                }}
                controlButtons={[
                  {
                    label: 'Edit',
                    color: 'bg-wri-gold hover:bg-yellow-400',
                    icon: (
                      <PencilSquareIcon className="w-4 h-4 text-white" />
                    ),
                    tooltip: {
                      id: `edit-tooltip-${team.name}`,
                      content: 'Edit Team',
                    },
                    onClick: () => {
                      // on click go to /teams/:teamName
                      router.push(
                        `/dashboard/teams/${team.name}/edit`
                      );
                    },
                  },
                  {
                    label: 'Delete',
                    color: 'bg-red-600 hover:bg-red-500',
                    icon: (
                      <TrashIcon className="w-4 h-4 text-white" />
                    ),
                    tooltip: {
                      id: `delete-tooltip-${team.name}`,
                      content: 'Delete Team',
                    },
                    onClick: () => handleOpenModal(team),
                  },
                  {
                    label: 'Download signups',
                    color: 'bg-wri-gold hover:bg-yellow-500',
                    icon: (
                      <ArchiveBoxArrowDownIcon className="w-4 h-4 text-white" />
                    ),
                    tooltip: {
                      id: `download-events-tooltip-${team.name}`,
                      content:
                        'Get CSV with all the signups for datasets in this org',
                    },
                    onClick: () =>
                      getDownloadEvents.mutate({
                        ownerOrg: team.name,
                      }),
                  },
                ]}
                rowSub={
                  <SubCardProfile
                    teams={team.children}
                    highlighted={team?.highlighted}
                    org2img={data?.org2Image}
                  />
                }
                isDropDown
                isPrivate={isPrivate}
              />
            </div>
          );
        })
      )}

      {selectedTeam && (
        <Modal
          open={open}
          setOpen={setOpen}
          className="sm:w-full sm:max-w-lg"
        >
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationTriangleIcon
                className="h-6 w-6 text-red-600"
                aria-hidden="true"
              />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <Dialog.Title
                as="h3"
                className="text-base font-semibold leading-6 text-gray-900"
              >
                Delete Team
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this Team?
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
            <LoaderButton
              variant="destructive"
              loading={deleteTeam.isLoading}
              onClick={() => deleteTeam.mutate(selectedTeam.name)}
              id={selectedTeam.name}
            >
              Delete Team
            </LoaderButton>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
          <div className="py-2">
            {errorMessage ? (
              <ErrorAlert
                text={errorMessage}
                title="Delete Team failed"
              />
            ) : null}
          </div>
        </Modal>
      )}
    </section>
  );
}
