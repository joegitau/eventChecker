# EVENTSTAG

An integrated Node.js solution to help Event hosts CHECK IN, TAG guests at their respective Events and subsequently generate XLS or PDF reports.

# Installation

Upon cloning the repo, 
1. create a **config** directory in your root folder
2. install **env-cmd** as a dev dependency - this will load the config variable that will be listed in our config file

````
npm i env-cmd --save-dev
`````

3. modify the package.json to configure the installed **env-cmd** package 

````
 "scripts": {
    "start": "node index.js",
    "dev": "env-cmd -f ./config/dev.env nodemon index.js"
  }
`````

4. inside the **config** directory, create a dev.env file and fill out the logic provided with your appropriate respective values - (this file contains the envrionment and config variables for the app)

````
PORT=3000
SENDGRID_API_KEY=YOUR_SEND_GRID_API_KEY
MONGODB_URL=mongodb://localhost/YOUR_DATABASE_NAME
JWT_PRIVATE_KEY=SOME_RANDOM_KEY

AUTH_TOKEN_EXPIRY_DATE=7
````

# Getting started

On a broader perspective, Eventstag is an event management application, but it extends
its functionalities into Checking in and Guest Badge printing. 

It consists of two user roles - **Admin** & **Event Hosts (regular users)**

#### Admin Privileges

the Admin has the following privileges:
1. Create, Read, Update and Delete OWN user profile. The Admin can also Create, View and Delete other Users.
2. Create, Read, Update and Delete OWN events. They can also view all Events  created by other users.
3. Create, Read, Update and Delete OWN guests.
4. Update the Client-side - they can edit the content on the homepage, about and register page)


#### Event Hosts Privileges

the Event Hosts have the following privileges:
1. Create, Read, Update and Delete OWN user profile. 
2. Create, Read, Update and Delete OWN events.
3. Create, Read, Update and Delete OWN guests.
4. Check in Guests and print Guest Badges

# Demo & Usage

Video Demo - [Eventstag Video Demo](https://www.linkedin.com/posts/joseph-gitau-3a244a8_an-easy-way-to-check-in-and-tag-guests-at-ugcPost-6587397114253361152-axel)

visit: [Eventstag Demo](https://joegitau-eventags.herokuapp.com/)

#### App's Process flow
1. Create an Account - once logged in, easily customize yur account by uploading profile avatars etc.
2. Create an Event - event cover images can be added as well
3. New Guests are automatically assigned to a specific selected Event
4. Check in your guests and print their badges.

> Happy tagging.
