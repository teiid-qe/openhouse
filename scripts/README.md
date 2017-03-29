# Configuring server for the Demo project

Following steps are neccessary to be able to run sample web app.

NOTES: 
1. All paths to scripts are relative to the location of this README.md
2. When there is a reference to `jboss-cli.sh` in configuration instructions, you should replace this with actual location within your server instance: `$JBOSS_HOME/bin/jboss-cli.sh`.

## Loading activities from Strava

[Homepage](http://www.strava.com)

### About
Strava is a social website where users can upload their sport activities. It exposes API to allow applications to access the data using OAuth2 authentication.

### Instructions
1. Create an account on Strava.
1. Register your application there. You'll get client-id, client-secret for your application.
1. Each user, that wants to use the app with Strava, can authorize the app to access his entries in Strava. An 'access_token' is generated on successful authorization.
1. Having three things: client-id, client-secret, access_token continue with following steps
1. Edit strava.properties with information from previous step
1. Make sure server is started
1. Run `jboss-cli.sh -c --file=strava.cli --properties=strava.properties`

## Loading data from Wifileaks

[Homepage](http://www.wifileaks.cz/index.php)

### About
Wifileaks is a community project that provides a list of free wifi spots.

### Instructions
1. Download and save a text file with wifi spots from the website.
1. Name it wifileaks.tsv
1. update scripts/config.properties and set 'wifileaks.files.dir' to point to the parent dir, where the wifileaks.tsv is saved.
1. Make sure server is started
1. run `jboss-cli.sh -c --file=wifileaks.cli --properties=wifileaks.properties` to configure resource-adapter that will access the .tsv file.

## Loading data from Wikipedia

[CS Wikipedia](https://cs.wikipedia.org/)
[MediaWiki API](https://www.mediawiki.org/wiki/API)

### Instructions
1. Make sure server is started
2. run `jboss-cli.sh -c --file=mediawiki.cli` to configure resource-adapter that will access Wikipedia using MediaWiki.

## Exporting to Google Sheets

### About

Here we define connector and VDB for exporting data to Google Sheet.

### Instructions

1. Update `gs-export.properties`.
2. Run `bin/jboss-cli.sh -c --file=gs-export.cli --properties=gs-export.properties`.
