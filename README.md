# Geshem

An interactive rain radar clone running on Mapbox GL, see it live at: [https://geshem.space](https://geshem.space)

The entire service is served off of static assets located in S3 buckets:

 - A static main index page, JS bundle and other static assets that are uploaded upon deploy, Vue.js-based
 - Radar images that are collected and indexed every minute by a recurring task running on AWS Lambda, written in Python

## Prerequisites

 - Node.js
 - Yarn
 - Serverless, for deploying the AWS Lambda task
 - AWS CLI, for static asset deployment to S3

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
$ yarn run deploystatic
```

### Cron Task

#### Deploy

```bash
$ yarn run deploycron
```

#### Invoke

For testing the cron task:

```bash
$ yarn run invokecron
```
