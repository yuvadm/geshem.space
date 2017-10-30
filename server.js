const express = require('express')
const app = express()

const redis = require('redis')
const client = redis.createClient(process.env.REDIS_URL)

const moment = require('moment')

const request = require('request')
const aws = require('aws-sdk')
const s3 = new aws.S3()

function fetchImages() {
  console.debug('Running fetchImages()')
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
              console.debug(`Fetching ${url}`)
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
                    Key: `${d}/${t}/${r}.png`,
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
                      client.multi([
                        ['set', key, data.ETag.slice(1, -1)],
                        ['del', 'images:latest']
                      ]).exec()
                    }
                  })
                }
              })
            }
            else {
              console.debug(`No need to fetch ${url}`)
            }
          })
        })
      }
    }
  })
}

app.set('port', (process.env.PORT || 3000));
app.set('view engine', 'pug')
app.set('views', __dirname + '/views');

app.use('/static', express.static(__dirname + '/static'))

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
        console.debug('Skipping fetch, waiting 60 seconds max')
      }
    })
  })
  next()
});

app.get('/imgs', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  client.get('images:latest', (err, reply) => {
    if (err) {
      console.log(err)
    }
    else if (!reply) {
      s3.listObjectsV2({
        Bucket: 'imgs.geshem.space',
        //StartAfter: moment().subtract(1, 'days').format('YYYYMMDD')
      }, (err, data) => {
        const imgs = data.Contents.slice(-20).map( (d) => d.Key)
        const imgres = JSON.stringify({
          '140': imgs.filter( (d) => d.endsWith('140.png') ),
          '280': imgs.filter( (d) => d.endsWith('280.png') )
        })
        client.set('images:latest', imgres)
        res.send(imgres)
      })
    }
    else {
      res.send(reply)
    }
  })
})

app.get('/', function (req, res) {
  res.render('index', { prod: process.env.NODE_ENV === 'production' })
})

app.listen(app.get('port'), function () {
  console.log('Starting geshem.space server on port', app.get('port'))
})

// poor man's background task
// run fetchImages() every minute
setInterval(fetchImages, 1000 * 60);
