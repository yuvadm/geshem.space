const express = require('express')
const app = express()

const redis = require('redis')
const client = redis.createClient(process.env.REDIS_URL)

const request = require('request')
const aws = require('aws-sdk')
const s3 = new aws.S3()

function fetchImages() {
  console.log('Running fetchImages()')
  request('http://map.govmap.gov.il/rainradar/radar.json', (error, response, body) => {
    if (error) {
      console.log(error)
    }
    else {
      var res = JSON.parse(body)
      for (let size of ['images140', 'images280']) {
        var imgs = res[size]
        Object.keys(imgs).forEach(function (img) {
          const ts = img.split(':')
          const url = 'http://' + imgs[img]
          const key = `fetched:${url}`
          client.get(key, (err, reply) => {
            if (!reply && reply != 'fetching') {
              console.log(`Fetching ${url}`)
              client.set(key, 'fetching')
              request({ url: url, encoding: null }, (error, response, body) => {
                if (err) {
                  console.log(err)
                  client.del(key)
                }
                else {
                  const r = size.slice(-3)
                  const d = ts.slice(0, 3).join('')
                  const t = ts.slice(3, 5).join('')
                  console.log(`Uploading to bucket`)
                  s3.putObject({
                    Bucket: 'imgs.geshem.space',
                    Key: `${r}/${d}/${t}.png`,
                    ContentType: response.headers['content-type'],
                    ContentLength: response.headers['content-length'],
                    Body: body,
                    ACL: 'public-read'
                  }, (err, data) => {
                    if (err) {
                      console.log(err)
                      client.del(key)
                    }
                    else {
                      client.set(key, data.ETag.slice(1, -1))
                    }
                  })
                }
              })
            }
            else {
              console.log(`No need to fetch ${url}`)
            }
          })
        })
      }
    }
  })
}

app.set('view engine', 'pug')

app.use('/static', express.static('static'))

app.use('/', function (req, res, next){
  res.on('finish', function(){
    client.get('fresh', (err, reply) => {
      if (err) {
        console.log(err)
      }
      else if (!reply) {
        client.setex('fresh', 60, true)
        fetchImages()
      }
      else {
        console.log('Skipping fetch, waiting 60 seconds max')
      }
    })
  })
  next()
});

app.get('/', function (req, res) {
  res.render('index', { prod: process.env.NODE_ENV === 'production' })
})

app.listen(3000, function () {
  console.log('Starting geshem.space server')
})
