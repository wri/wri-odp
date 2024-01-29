## DashBoard

`/dashboard` - to visit dashboard page

The left sidebar contains the login user details and accessible list of pages

-user profile-

![](./profile.png)

Also contains Main content section

![](./dashboard.png)

The `Quick action` container contains button that easily link to creating some of the entities.

And the `see all ->` on other container leads to the main page of that container

The setting button once clicked enables the container to be rearranged using drag and drop action

![](./drag.png)

and once then with re-arrangement click the check button to save the arrangment for your next visit.

## Dashboard dataset Page `/dashboard/datasets`

Contain tabs of different categories of dataset

![](./datasetpage.png)

Each dataset item on hover contains a dropdown button to show it full details

![](./datasetdetails.png)

You can also Search, filter by `teams` and `topics`, also check paginated data

Note: for search, you can click enter key after typing the keyword

## Activity stream `/dashboard/activity-stream`

List all actions , like delete, update and creation of dataset, Teams and topics

![](./activitypage.png)

contains filter by activity type and pagination

![](./activityfilter2.png)

contains filter by time and days

![](./activityfilter.png)

contains `Filter by` select options: this let you chose the entity you want to filter the activity stream by, either by dataset favorites or Teams you are following or belong to

![](./filterby.png)

In the filterby you can select dataset for example to see list of dataset you are following

![](./filterdataset.png)

then click on one of the dataset

![](./filterdataset1.png)

you can also select filter by Teams

![](./filterteams.png)

and then select the team

![](./teamsselect.png)

## Teams `/dashboard/teams`

Display list of teams the user have access to

- contains search functionality and pagination

- On hover each Team profile , you can see the button `view teams` to go to that team page

![](./teams.png)

on hover

![](./teamhover.png)

## Topics `/dashboard/topics`

Display the list of topics user have access to

Each Topics has a drop down that display list of subtopics

![](./topics.png)

## Users `/dashboard/users`

Display list of users

Each user row contains dropdown to display list of teams user belongs to

![](./users.png)

### Delete Entities

Each entities ( Dataset, Team, Topics and Users), have thesame delete approach

here is how you delete a Dataset has an authorized user

- Place your mouse over the dataset you want to delete to see the delete button

![](./delete1.png)

- click the the confirm delete button

![](delete2.png)

- remove user from an organization: click on the delete button in the user drop down to remove user from an organization

![](./removeuser.png)

### Notification

Notification page can be accessed via `/dashboard/notifications`

![](./notification.png)

As you can see, we have 3 unread notification on the sidebar, and also the yellow div beside each notification row shows that its unread

We can mark on of them unread

![](./selectread.png)

click update

![](./selectread1.png)

can also do **bulk update** e.g mark all as read

![](./selectall.png)

every notification is now marked has read

![](./selectall1.png)

Also on hover you can go the the sender user page and also the dataset page

![](./links.png)

Notification can also ve view from the overview dashboard page `/dashboard`

![](./notoverview.png)

## Favorite Dataset

To add dataset to favorite, go to the dataset page and click on the star icon

![](./addfave.png)

click add in the popup modal to confirm action

![](./addfave1.png)

see changed refelected

![](./addfave2.png)

also favorite get reflected in `/dashboard` overview

![](./faved.png)

and also in `/dashboard/datasets` page

![](./fave3.png)

Dataset can be remove from favorite

![](./addfave2.png)

click on the star icon

![](./removefave.png)

see changed reflected

![](./addfave.png)

## Add User

To add user to the platform visit `/dashboard/users` and click on Add user tab

![](./adduser.png)

You can add a user without assigning them to a team

![](./adduser1.png)

And if a team is selected , the Role field get displayed

![](./adduser2.png)

and once the user is created the user should recieve a notification.

Also you can visit the users page to view newly added user

![](./adduser3.png)

## Approval workflow

Visit `dashboard/approval-request`

![](./approv1.png)

The page contain the list of dataset in approval workflow. The yellow indication ebhnd the dataset shows the dataset is still pending (not yet rejected, and if approved, it won't be on the list). Also the side par contains the count of pending dataset

Quick review of dataset

![](./approv2.png)

If dataset have no diff (i.e no new version) current metadata are displayed

Dataset can be rejected with a reason

![](./approv3.png)

add reason for rejection

![](./approv9.png)

Click on review to go to dataset page for review

![](./approv4.png)

The toggle button is used to toglle between new version and old version. if there is no new version, toggle won't appear

version review:

![](./approv5.png)

Click on the issue tab to see list of issues, it has dropdown for open and close issues

![](./approv10.png)

let comment and re-open an issue

![](./approv11.png)

Delete a dataset

![](./approv13.png)

result after delete

![](./approv14.png)

User can go do `dashboard/datasets` and click Awaiting approval to see list of awaiting approval dataset

![](./approv6.png)

click on `view issues` to go to dataset page to see if any issues

![](./approv8.png)
