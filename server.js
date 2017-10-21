const express = require('express')
const app = express()

app.set('view engine', 'pug')

app.use('/static', express.static('static'))

app.get('/', function (req, res) {
  res.render('index', { prod: process.env.NODE_ENV === 'production' })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
