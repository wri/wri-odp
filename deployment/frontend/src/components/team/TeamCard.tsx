import React from 'react';
import Image from 'next/image';
import { type GroupTree, type GroupsmDetails } from '@/schema/ckan.schema';
import { type Organization } from '@portaljs/ckan';
import Link from 'next/link';
import { visibilityTypeLabels } from '@/utils/constants';
import Chip from '@/components/_shared/Chip';

//write a typeguard to check if the topic is a GroupTree
function isGroupTree(org: GroupTree | Organization): org is GroupTree {
    return (org as GroupTree).children !== undefined;
}

export default function TeamCard({
    team,
    teamsDetails,
    subTeamCounts,
}: {
    team: GroupTree | (Organization & { numSubTeams: number; notes?: string });
    teamsDetails: Record<string, GroupsmDetails>;
    subTeamCounts?: Record<string, number>;
}) {
    return (
        <Link
            href={`/teams/${team.name}`}
            className="text-wri-black flex flex-col w-full font-acumin max-w-[400px] ml-auto mr-auto"
        >
            <div className="relative w-full h-56 2xl:h-64">
                <Image
                    src={`${
                        teamsDetails[team.id]?.img_url
                            ? teamsDetails[team.id]?.img_url
                            : '/images/placeholders/teams/teamdefault.png'
                    }`}
                    alt={`Team - ${team.title}`}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="bg-white w-[95%] pt-2 -ml-[1px] -mt-6 z-10 line-clamp-2 h-[4.25rem] pb-1.5">
                <h2 className="text-2xl font-bold w-[80%]">{team.title}</h2>
            </div>
            {'visibility' in team && team.visibility === 'private' && (
                <div className="mt-2 mb-1">
                    <Chip
                        text={visibilityTypeLabels[team.visibility] ?? ''}
                        className={''}
                    />
                </div>
            )}
            <article className=" line-clamp-3 w-[88%] font-light text-base mt-2 leading-[1.375rem] h-16">
                {isGroupTree(team)
                    ? teamsDetails[team.id]?.description ||
                      team.description ||
                      teamsDetails[team.id]?.notes ||
                      team.notes
                    : team.description || team.notes}
            </article>
            <div className="flex font-light text-sm text-wri-black mt-1 leading-[1.375rem] items-center">
                {isGroupTree(team) && (
                    <span className="mr-2">
                        {teamsDetails[team.id]?.package_count &&
                        teamsDetails[team.id]?.package_count! <= 1
                            ? `${teamsDetails[team.id]?.package_count || 0} Dataset`
                            : `${
                                  teamsDetails[team.id]?.package_count || 0
                              } Datasets`}
                    </span>
                )}
                {!isGroupTree(team) && (
                    <span className="mr-2">
                        {team.package_count && team.package_count <= 1
                            ? `${team.package_count} Dataset`
                            : `${team.package_count} Datasets`}
                    </span>
                )}
                {isGroupTree(team) && (
                    <>
                        <div className="border-l border-wri-black h-4  mx-2"></div>
                        <span className="ml-2">
                            {team.children.length} SubTeams
                        </span>
                    </>
                )}
                {!isGroupTree(team) && subTeamCounts && (
                    <>
                        <div className="border-l border-wri-black h-4  mx-2"></div>
                        <span className="ml-2">
                            {subTeamCounts[team.name] ?? 0} SubTeams
                        </span>
                    </>
                )}
            </div>
        </Link>
    );
}
