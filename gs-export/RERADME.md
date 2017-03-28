# Google Sheets

## About

Here we define connector and VDB for exporting data to Google Sheet.

## Instructions

1. Update `gs-export/scripts/config.properties`.
2. Run `bin/jboss-cli.sh -c --file=<path-to-repo>/gs-export/scripts/ra.cli --properties=<path-to-repo>/gs-export/scripts/config.properties`.
3. Deploy `gs-export/vdb/gs-export-vdb.xml` to the Teiid server.
