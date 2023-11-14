# TEAMS

## Create Team

You can create a team in the `/dashboard/teams/new` route where you can define

- Title for the team
- URL for the team, which is going to act as an ID for the team, and act as URL in the public pages such `/teams/{team url}`
- Description for the team
- You can also upload an image to act as logo or featured image for the team 
- You can also define a parent for the team, which is going to be another team and is going to decide the place of that team inside the hierarchy 

The page looks like this

![New team page](./create.png)

## Edit Team

You can edit a team by going to `/dashboard/teams/{team url}/edit` or by clicking on the yellow icon in the teams list like in the image below

![All teams page](./list.png)

Once you go there you can change all the fields that were defined in the new team except the `url` which needs to stay the same for integrity of the system sake

![Edit team page](./edit.png)

In this edit page you can also delete by clicking on the "Delete Button" which should open up a modal for confirmation

![Delete team modal](./delete.png)
