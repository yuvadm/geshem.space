import mapboxgl from 'mapbox-gl';
import Vue from 'vue';
import Geshem from './Geshem.vue'

var app = new Vue({
  el: '#app',
  render: h => h(Geshem),
  data: {
    imgs: window.imgs,
    res: 280,
    slider: 0,
    rasterCoords: {
      140: [
        [33.35317413, 33.27232471],
        [36.32243686, 33.27232471],
        [36.32243686, 30.72293428],
        [33.35317413, 30.72293428]
      ],
      280: [
        [31.93095218, 34.5156862],
        [37.86644267, 34.5156862],
        [37.86644267, 29.42911589],
        [31.93095218, 29.42911589]
      ]
    }
  }
});

mapboxgl.accessToken = 'pk.eyJ1IjoieXV2YWRtIiwiYSI6ImNpcnMxbzBuaTAwZWdoa25oczlzZmkwbHcifQ.UHtLngbKm9O8945pJm23Nw';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v9',
  container: 'map',
  maxZoom: 10,
  minZoom: 5,
  zoom: 6.3,
  center: [35, 31.9],
  hash: false
});

function addRadarSource(res, i, url) {
  map.addSource('radar-' + res + '-' + i, {
    type: 'image',
    url: '/static/img/' + url,
    coordinates: app.rasterCoords[res]
  })
}

function addRadarLayer(res, i) {
  map.addLayer({
    id: 'radar-' + res + '-' + i,
    source: 'radar-' + res + '-' + i,
    type: 'raster',
    paint: {
      'raster-opacity': 0.85
    }
  })
}

function removeRadarLayer(res, i) {
  map.removeLayer('radar-' + res + '-' + i)
}

map.on('style.load', function () {
  var i = 0;
  while (i < app.imgs['140'].length) {
    addRadarSource('140', i, app.imgs['140'][i++])
  }
  var i = 0;
  while (i < app.imgs['280'].length) {
    addRadarSource('280', i, app.imgs['280'][i++])
  }
  addRadarLayer('280', 0)
})
