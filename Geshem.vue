<template>
  <div id="geshem">
    <div id="date">14-10-2017</div>
    <div id="time">21:58</div>
    <vue-slider ref="slider" v-model="slider" :min=1 :max=7></vue-slider>
  </div>
</template>

<script>
  import vueSlider from 'vue-slider-component';
  import mapboxgl from 'mapbox-gl';
  export default {
    name: 'geshem',
    components: {
      'vue-slider': vueSlider
    },
    data: function () {
      return {
        imgs: window.imgs,
        res: 280,
        slider: 7,
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
        },
        map: new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/dark-v9',
          container: 'map',
          maxZoom: 10,
          minZoom: 5,
          zoom: 6.3,
          center: [35, 31.9],
          hash: false
        })
      }
    },
    created: function () {
      var vm = this;
      this.map.on('style.load', function () {
        var i = 0;
        while (i < vm.imgs['140'].length) {
          vm.addRadarSource('140', i, vm.imgs['140'][i++])
        }
        var i = 0;
        while (i < vm.imgs['280'].length) {
          vm.addRadarSource('280', i, vm.imgs['280'][i++])
        }
        vm.addRadarLayer('280', 0)
      })
    },
    methods: {
      addRadarSource: function(res, i, url) {
        this.map.addSource('radar-' + res + '-' + i, {
          type: 'image',
          url: '/static/img/' + url,
          coordinates: this.rasterCoords[res]
        })
      },
      addRadarLayer: function(res, i) {
        this.map.addLayer({
          id: 'radar-' + res + '-' + i,
          source: 'radar-' + res + '-' + i,
          type: 'raster',
          paint: {
            'raster-opacity': 0.85
          }
        })
      },
      removeRadarLayer: function(res, i) {
        this.map.removeLayer('radar-' + res + '-' + i)
      }
    },
    watch: {
      slider: function (to, from) {
        this.removeRadarLayer(this.res, 7-from);
        this.addRadarLayer(this.res, 7-to);
      }
    }
  }
</script>

<style lang="scss">
  #geshem {
    position: absolute;
  }
  #date {
    color: white;
    font-size: 1.2em;
  }
  #time {
    color: white;
    font-size: 1.6em;
  }
</style>
