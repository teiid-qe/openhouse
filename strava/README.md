# Strava

[Homepage](http://www.strava.com)

## About
Strava is a social website where users can upload their sport activities. It exposes API to allow applications to access the data using OAuth2 authentication.

## Instructions
1. Create an account on Strava.
1. Register your application there. You'll get client-id, client-secret for your application.
1. Each user, that wants to use the app with Strava, can authorize the app to access his entries in Strava. An 'access_token' is generated on successful authorization.
1. Having three things: client-id, client-secret, access_token continue with following steps
1. Edit scripts/config.properties with information from previous step
1. Start server
1. Run `jboss-cli.sh -c --file=scripts/sd.cli --properties=scripts/config.properties`
1. Wait for server to reload
1. Run `jboss-cli.sh -c --file=scripts/ra.cli --properties=scripts/config.properties`
1. Deploy vdb/strava-vdb.xml
