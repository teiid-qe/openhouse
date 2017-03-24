# Wifileaks

[Homepage](http://www.wifileaks.cz/index.php)

## About
Wifileaks is a community project that provides a list of free wifi spots.

## Instructions
1. Download and save a text file with wifi spots from the website.
1. Name it wifileaks.tsv
1. update scripts/config.properties and set 'wifileaks.files.dir' to point to the parent dir, where the wifileaks.tsv is saved.
1. Start Teiid server
1. run `jboss-cli.sh -c --file=scripts/ra.cli --properties=scripts/config.properties` to configure resource-adapter that will access the .tsv file.
1. deploy vdb/wifilieaks-vdb.xml to the server
