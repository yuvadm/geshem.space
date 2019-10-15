# Geshem 🌧️

<img src="public/screenshot.png" height="600" align="right">

An interactive rain radar clone running on Mapbox GL, see it live at: [https://geshem.space](https://geshem.space)

The entire service is served off of static assets located in S3 buckets:

 - A static main index page, React-based JS bundle and other static assets that are uploaded upon deploy
 - Radar images that are collected and indexed every minute by a Python recurring task running on AWS Lambda

## Prerequisites

 - Node.js
 - Yarn
 - Serverless, for deploying the AWS Lambda task
 - AWS CLI, for static asset deployment to S3

## Dev

Install dependencies and run dev server:

```bash
$ yarn install
$ yarn start
```

### Deploy

Build the JS bundle:

```bash
$ yarn build
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

## Architecture

For some architectural notes on the deployment process go read https://yuv.al/blog/an-architecture-for-periodically-updating-static-websites/
