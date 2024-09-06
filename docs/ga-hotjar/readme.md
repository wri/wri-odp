## Setup

### Create a Google Tag manager

go to `https://tagmanager.google.com/` click on `create Account`

![](./create_gtm.png)

fill up the required field

![](./create_field.png)

after creating the account copy the tag below into your website header and body

![](./gtm1.png)

and it should lead to this workspace page

![](./gtm2.png)

Let start with creating different triggers required for our report

![](./gtm3.png)

To create a new trigger click on the new button and set the configuration

![](./gtm4.png)

you can select the click element for instance

![](./gtm5.png)

save and rename the trigger

![](./gtm6.png)

also we can add `variables` to track , GTM already have most of the important variable has built in, we just need to import them

![](./gtm7.png)

to add more builtin you can click on `configure` at the top right

also we have access to create custom user defined variable. here is one to track Resource title on download

in `User defined variables` click `new`

![](./gtm8.png)

Now we can create Tags. this help create event that can be track on Google Analtyics for report

To start, copy your `measurement id` from Google analytics.

GA > Admin > Data streams

![](./gtm9.png)

Back to Google tag manager (GTM), click on Tag and then click `New` to create a google tag

![](./gtm10.png)

add your measurment id

![](./gtm11.png)

click save. also here is an example of creating Tag to track dataset downloads

![](./gtm12.png)

and then add a trigger

![](./gtm13.png)

and here is the current list of Tags

![](./gtm14.png)

## Report

1. General user report:
   Go to Google analytics . By your left click on `Home` icon

   ![](./gtm15.png)

   this shows the number of user per week, per month etc has shown below

   ![](./gtm16.png)

   to see the full report click on `view report snapshot`

   ![](./gtm17.png)

   To share report click on the share icon to the top right

   ![](./gtm18.png)

   For more analytics report, you can always expand the snapshot in the homepage, e.g here is an example for `user/ country`

   ![](./gtm19.png)

   You can also click on the `+` button to add more column

   ![](./gtm20.png)

2. Visited Pages:

   To your left in google-analytics dashboard, click on `Report > Engagement > Pages and Screens`

   ![](./gtm21.png)

   it has search bar to filter per for pages

   you can also click on the drop down to switch the column

   ![](./gtm22.png)

3. Custom report. we already have some of the report build down for exploration

   ![](./gtm23.png)

   here is an example of `Dataset visit` report

   ![](./gtm25.png)

   and also for `Dataset downloads`

   ![](./gtm26.png)

   `map interactions` to track `layer id` , `lattitude` , `longitude` and `zoom level`

   ![](./gtm35.png)

   `Table views` contains data on `View table preview` and the default table preview

   ![](./gtm36.png)

## Adding Hotjar

Go to https://insights.hotjar.com/site/list and create a new site or update a site

![](./gtm27.png)

and then copy the tracking code to the site

![](./gtm28.png)

once that is done we need to create a survey to know why user are downloading dataset. to do that, we will trigger HOtjar via GTM

so fo to gtm to create a tag
![](./gtm29.png)

and then back to hotjar to create survey

![](./gtm30.png)

we are going to select `Customer satisfaction (CSAT) survey` templates

![](./gtm31.png)

You can update different part of the survey. here we will update the Question and how we trigger the survey

![](./gtm32.png)

and also the trigger. we will make use of the event `click` we created from GTM

![](./gtm33.png)

and then click save

To view the survey created, you can go to any dataset page containing a resource click on download and this will trigger the survey for that user, if the user has never fill out a survey

![](./gtm34.png)
