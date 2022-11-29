# Geshem 🌧️

<img src="public/screenshot.png" height="600" align="right">

An interactive rain radar clone running on Mapbox GL, see it live at: [https://geshem.space](https://geshem.space)

The entire service is served off of static assets located in S3 buckets:

- A static main index page, React-based JS bundle and other static assets that are uploaded upon deploy
- Radar images that are collected and indexed every minute by a Python recurring task running on AWS Lambda

For some architectural notes on the deployment process go read https://yuv.al/blog/an-architecture-for-periodically-updating-static-websites/

## Prerequisites

- Node.js
- Yarn
- Serverless, for deploying the AWS Lambda task

## Dev

Install dependencies and run dev server:

```bash
$ npm install
$ DANGEROUSLY_DISABLE_HOST_CHECK=true npm start
```

### Deploy

Deployment is handled transparently via Vercel.

### Cron Task

#### Dev

```bash
$ cd cron
$ pipenv install
```

#### Deploy

```bash
$ npm run deploycron
```

#### Invoke

For testing the cron task:

```bash
$ npm run invokecron
```
