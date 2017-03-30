# Web-app

## Abount

This is a web application which demostrates usage of VDBs.

## Instructions

### Build
Run `mvn package -Dapi.key=<your-google-api-key>`

### Install
Deploy WAR archive from `target` directory to Teiid application server.

### Additional server configuration
Add role `odata` to user in application-roles.properties.
