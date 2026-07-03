import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc';
import { env } from '@/env.mjs';
import {
  searchHierarchy,
  getUserGroups,
  groupList,
  fetchFacets,
} from '@/utils/apiUtils';
import { searchSchema } from '@/schema/search.schema';
import type {
  FolloweeList,
  GroupTree,
  GroupsmDetails,
} from '@/schema/ckan.schema';
import type { CkanResponse, User } from '@/schema/ckan.schema';
import type { Group } from '@portaljs/ckan';
import { type TopicHierarchy } from '@/interfaces/topic.interface';
import type Topic from '@/interfaces/topic.interface';

import { TopicSchema } from '@/schema/topic.schema';
import { replaceNames } from '@/utils/replaceNames';
import { sendMemberNotifications } from '@/utils/apiUtils';
import {
  flattenTree,
  collectGroupDetails,
  collectGroupTreeImages,
} from '@/utils/flattenGroupTree';

export const TopicRouter = createTRPCRouter({
  getUsersTopics: protectedProcedure
    .input(searchSchema)
    .query(async ({ input, ctx }) => {
      const groupTree = await searchHierarchy({
        isSysadmin: ctx.session.user.sysadmin,
        apiKey: ctx.session.user.apikey,
        q: input.search || undefined,
        group_type: 'group',
      });

      const paginated = groupTree.slice(
        input.page.start,
        input.page.start + input.page.rows
      );

      return {
        topics: paginated,
        topic2Image: collectGroupTreeImages(paginated),
        count: groupTree.length,
      };
    }),
  getTopicsHierarchy: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    const topicHierarchyRes = await fetch(
      `${env.CKAN_URL}/api/action/group_tree`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${user.apikey}`,
        },
      }
    );
    let userTopics = null;
    const userTopicsRes = await fetch(
      `${env.CKAN_URL}/api/action/group_list?all_fields=True`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${user.apikey}`,
        },
      }
    );
    const _userTopics: CkanResponse<Group[]> = await userTopicsRes.json();
    if (!_userTopics.success && _userTopics.error)
      throw Error(replaceNames(_userTopics.error.message));
    userTopics = _userTopics.result.map((topic) => topic.name);
    const tree: CkanResponse<TopicHierarchy[]> =
      await topicHierarchyRes.json();
    if (!tree.success && tree.error)
      throw Error(replaceNames(tree.error.message));
    return { hierarchy: tree.result, userTopics };
  }),
  getTopicsHomePage: publicProcedure.query(async ({ ctx }) => {
    const user = ctx.session?.user;
    const apiKey = user ? user.apikey : null;
    const [topics, groupTree] = await Promise.all([
      groupList({ apiKey }),
      searchHierarchy({
        isSysadmin: true,
        apiKey: apiKey ?? '',
        q: '',
        group_type: 'group',
      }),
    ]);
    const topicDetails = topics.reduce(
      (acc, org) => {
        acc[org.id] = {
          img_url: org.image_display_url,
          description: org.description,
          package_count: org.package_count,
          name: org.name,
        };
        return acc;
      },
      {} as Record<string, GroupsmDetails>
    );
    if (user) {
      const facets = await fetchFacets(
        topicDetails,
        'groups',
        ctx?.session?.user.apikey ?? ''
      );
      for (const group in topicDetails) {
        const topic = topicDetails[group]!;
        topic.package_count = facets[topic.name] ?? 0;
      }
    }
    return {
      topics: groupTree,
      topicDetails: topicDetails,
      count: groupTree.length,
    };
  }),
  getAllTopics: protectedProcedure.query(async ({ ctx }) => {
    return await groupList({ apiKey: ctx.session.user.apikey ?? null });
  }),
  editTopic: protectedProcedure
    .input(TopicSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const user = ctx.session.user;
        const newMembers = [];
        for (const member of input.members) {
          newMembers.push({
            name: member.user.value,
            capacity: member.capacity.value,
          });
        }
        try {
          sendMemberNotifications(
            user.id,
            newMembers,
            input.users,
            input.id,
            'topic'
          );
        } catch (e) {
          console.error(e);
        }
        input.users = newMembers;
        const body = JSON.stringify({
          ...input,
          groups:
            input.parent && input.parent.value !== ''
              ? [{ name: input.parent.value }]
              : [],
        });
        const topicRes = await fetch(
          `${env.CKAN_URL}/api/action/group_patch`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `${user.apikey}`,
            },
            body,
          }
        );
        const topic: CkanResponse<Group> = await topicRes.json();
        if (!topic.success && topic.error) {
          if (topic.error.message)
            throw Error(replaceNames(topic.error.message));
          throw Error(replaceNames(JSON.stringify(topic.error)));
        }
        return topic.result;
      } catch (e) {
        let error =
          'Something went wrong please contact the System Administrator';
        if (e instanceof Error) error = e.message;
        throw Error(replaceNames(error));
      }
    }),
  getTopic: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const topicRes = await fetch(
        `${env.CKAN_URL}/api/action/group_show?id=${input.id}&include_users=True`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${user.apikey}`,
          },
        }
      );
      const topic: CkanResponse<Topic & { groups: Topic[] }> =
        await topicRes.json();
      if (!topic.success && topic.error)
        throw Error(replaceNames(topic.error.message));
      return {
        ...topic.result,
        parent: topic.result.groups[0]?.name ?? null,
      };
    }),
  deleteTopic: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const topicRes = await fetch(
        `${env.CKAN_URL}/api/action/group_delete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${user.apikey}`,
          },
          body: JSON.stringify({ id: input.id }),
        }
      );
      const topic: CkanResponse<Topic> = await topicRes.json();
      if (!topic.success && topic.error) {
        if (topic.error.message)
          throw Error(replaceNames(topic.error.message));
        throw Error(replaceNames(JSON.stringify(topic.error)));
      }
      return {
        ...topic.result,
      };
    }),
  getTopicUsers: protectedProcedure
    .input(z.object({ id: z.string(), capacity: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const membersListRes = await fetch(
        `${env.CKAN_URL}/api/action/member_list?id=${input.id}${input.capacity ? `&capacity=${input.capacity}` : ''
        }&object_type=user`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${user.apikey}`,
          },
        }
      );
      const membersList: CkanResponse<string[][]> =
        await membersListRes.json();
      return membersList.result;
    }),
  createTopic: protectedProcedure
    .input(TopicSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const user = ctx.session.user;
        const body = JSON.stringify({
          ...input,
          groups:
            input.parent && input.parent.value !== ''
              ? [{ name: input.parent.value }]
              : [],
        });
        const topicRes = await fetch(
          `${env.CKAN_URL}/api/action/group_create`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `${user.apikey}`,
            },
            body,
          }
        );
        const topic: CkanResponse<Group> = await topicRes.json();
        if (!topic.success && topic.error) {
          if (
            //@ts-ignore
            topic.error.name[0] ===
            'Group name already exists in database'
          ) {
            throw Error(
              '[!] A page with this URL already exists. Please choose a different URL.'
            );
          }
          if (topic.error.message)
            throw Error(replaceNames(topic.error.message));
          throw Error(replaceNames(JSON.stringify(topic.error)));
        }
        return topic.result;
      } catch (e) {
        let error =
          'Something went wrong please contact the System Administrator';
        if (e instanceof Error) error = e.message;
        if (
          replaceNames(error) ==
          'Topic name already exists in database or there is a Team with this name'
        ) {
          throw Error(
            '[!] A page with this URL already exists. Please choose a different URL.'
          );
        }
        throw Error(replaceNames(error));
      }
    }),
  deleteDashBoardTopic: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const response = await fetch(
        `${env.CKAN_URL}/api/3/action/group_delete`,
        {
          method: 'POST',
          body: JSON.stringify({ id: input }),
          headers: {
            Authorization: ctx.session.user.apikey,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = (await response.json()) as CkanResponse<null>;
      if (!data.success && data.error)
        throw Error(replaceNames(data.error.message));
      return data;
    }),
  getGeneralTopics: publicProcedure
    .input(searchSchema)
    .query(async ({ input, ctx }) => {
      const groupTree = await searchHierarchy({
        isSysadmin: true,
        apiKey: ctx?.session?.user.apikey ?? '',
        q: input.search || undefined,
        group_type: 'group',
      });

      if (groupTree.length === 0) {
        return {
          topics: groupTree,
          topicDetails: {},
          count: 0,
        };
      }

      const paginated = groupTree.slice(
        input.page.start,
        input.page.start + input.page.rows
      );

      const topicDetails = collectGroupDetails(paginated);

      if (ctx.session?.user) {
        const facets = await fetchFacets(
          topicDetails,
          'groups',
          ctx.session.user.apikey ?? ''
        );

        for (const group in topicDetails) {
          const topic = topicDetails[group]!;
          topic.package_count = facets[topic.name] ?? 0;
        }
      }

      return {
        topics: paginated,
        topicDetails,
        count: groupTree.length,
      };
    }),
  getTopicV2: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const topicRes = await fetch(
        `${env.CKAN_URL}/api/action/group_show?id=${input.id}&include_users=True`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${user.apikey}`,
          },
        }
      );
      const topic: CkanResponse<Group> = await topicRes.json();
      if (!topic.success && topic.error)
        throw Error(replaceNames(topic.error.message));
      return {
        topic: topic.result,
      };
    }),
  list: publicProcedure.query(async ({ ctx, input }) => {
    const topicRes = await fetch(
      `${env.CKAN_URL}/api/action/group_list?all_fields=True`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const topic: CkanResponse<Group[]> = await topicRes.json();
    if (!topic.success && topic.error)
      throw Error(replaceNames(topic.error.message));
    return {
      topics: topic.result,
    };
  }),
  getNumberOfSubtopics: publicProcedure.query(async ({ ctx, input }) => {
    const topicRes = await fetch(
      `${env.CKAN_URL}/api/action/group_list_wri?q=`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const topics: CkanResponse<GroupTree[]> = await topicRes.json();
    if (!topics.success && topics.error)
      throw Error(replaceNames(topics.error.message));
    const numOfSubtopics = flattenTree(topics.result);
    return numOfSubtopics;
  }),

  getFollowedTopics: protectedProcedure.query(async ({ ctx }) => {
    const response = await fetch(
      `${env.CKAN_URL}/api/3/action/followee_list?id=${ctx.session.user.id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${ctx.session.user.apikey}`,
        },
      }
    );
    const data = (await response.json()) as CkanResponse<FolloweeList[]>;
    if (!data.success && data.error) throw Error(data.error.message);
    const result = data.result.reduce((acc, item) => {
      if (item.type === 'group') {
        const t = item.dict as Group;
        acc.push(t);
      }
      return acc;
    }, [] as Group[]);
    return result;
  }),
  getPossibleMembers: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const topicRes = await fetch(
        `${env.CKAN_URL}/api/action/group_show?id=${input.id}&include_users=True`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${user.apikey}`,
          },
        }
      );
      const topic: CkanResponse<Topic & { groups: Topic[] }> =
        await topicRes.json();
      if (!topic.success && topic.error) {
        if (topic.error.message)
          throw Error(replaceNames(topic.error.message));
        throw Error(replaceNames(JSON.stringify(topic.error)));
      }
      const topicUsers = topic?.result?.users?.map(
        (user) => user.name
      ) as string[];
      const usersRes = await fetch(
        `${env.CKAN_URL}/api/action/user_list?all_fields=True&limit=1000`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${user.apikey}`,
          },
        }
      );
      const users: CkanResponse<User[]> = await usersRes.json();
      if (!users.success && users.error) {
        if (users.error.message)
          throw Error(replaceNames(users.error.message));
        throw Error(replaceNames(JSON.stringify(users.error)));
      }

      return users.result.filter(
        (user) => user.name && !topicUsers.includes(user.name)
      );
    }),
  getCurrentMembers: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const topicRes = await fetch(
        `${env.CKAN_URL}/api/action/group_show?id=${input.id}&include_users=True`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${user.apikey}`,
          },
        }
      );
      const topic: CkanResponse<Topic & { groups: Topic[] }> =
        await topicRes.json();
      if (!topic.success && topic.error) {
        if (topic.error.message)
          throw Error(replaceNames(topic.error.message, true));
        throw Error(replaceNames(JSON.stringify(topic.error), true));
      }

      return topic.result.users;
    }),
  removeMember: protectedProcedure
    .input(z.object({ id: z.string(), username: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const topicRes = await fetch(
        `${env.CKAN_URL}/api/action/member_delete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${user.apikey}`,
          },
          body: JSON.stringify({
            id: input.id,
            object: input.username,
            object_type: 'user',
          }),
        }
      );
      const topic: CkanResponse<Topic & { groups: Topic[] }> =
        await topicRes.json();
      if (!topic.success && topic.error) {
        if (topic.error.message)
          throw Error(replaceNames(topic.error.message, true));
        throw Error(replaceNames(JSON.stringify(topic.error), true));
      }
      return topic.result;
    }),
});
