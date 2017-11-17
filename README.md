# Geshem

An interactive rain radar clone running on Mapbox GL, see it live at: [https://geshem.space](https://geshem.space)

The entire service is served off of static assets located in S3 buckets:
 - A staticmain index page, JS bundle and other static assets that are uploaded upon deploy
 - Radar images that collected and indexed every minute by a recurring task running on AWS Lambda

## Prerequisites

 - Node.js
 - Yarn
 - Serverless

## Dev

### Static Assets

Install dependencies:
```bash
$ yarn install
```

Build the JS bundle:

```bash
$ yarn run build
```

Deploy new static assets to S3:

```bash
$ yarn run deploy_static
```

### Cron Task

#### Deploy

```bash
$ yarn run deploy_cron
```

#### Invoke

```bash
$ yarn run invoke_cron
```
