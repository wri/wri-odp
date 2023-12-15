# TOPICS

## Create Topic

You can create a topic in the `/dashboard/topics/new` route where you can define

- Title for the topic
- URL for the topic, which is going to act as an ID for the topic, and act as URL in the public pages such `/topics/{topic url}`
- Description for the topic
- You can also upload an image to act as a logo or featured image for the topic
- You can also define a parent for the topic, which is going to be another topic and is going to decide the place of that topic inside the hierarchy

The page looks like this

![New topic page](./create.png)

## Edit Topic

You can edit a topic by going to `/dashboard/topics/{topic url}/edit` or by clicking on the yellow icon in the topics list like in the image below

![All topics page](./list.png)

Once you go there you can change all the fields that were defined in the new topic except the `url` which needs to stay the same for the integrity of the system's sake

![Edit topic page](./edit.png)

In this edit page, you can also delete by clicking on the "Delete Button" which should open up a modal for confirmation

![Delete topic modal](./delete.png)

## Topic Discovery

Topic discovery `/topics`. contains all available topics

![Topics](./topics.png)

Topics are searchable and paginated. clicking on any of the topics leads to their individual details
page, containing subtopics and their associated dataset

![Topic page](./onetopic.png)

## Topic Member Management

Topic members can be managed from the topic edit page "Members" tab

![Members management](./members.png)

To add a new member, simply click on "Add another member", select the user and their capacity, and then click "Save" (you can also edit any existing members, or remove them by clicking on the small red `-` button on the right)

![Members management addition](./members-add.png)