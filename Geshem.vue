<template>
  <div id="geshem">
    <div id="datetime">
      <div id="date">{{ date }}</div>
      <div id="time">{{ time }}</div>
    </div>
    <div id="slider">
      <vue-slider ref="slider" v-model="slider" :min=0 :max=9 :height=20 :dot-size=45 :tooltip=false></vue-slider>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import vueSlider from 'vue-slider-component';
  import mapboxgl from 'mapbox-gl';
  import moment from 'moment-timezone';

  export default {
    name: 'geshem',
    components: {
      'vue-slider': vueSlider
    },
    data: function () {
      return {
        imgs: null,
        res: 280,
        slider: 9,
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
        mapLoaded: false,
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
    computed: {
      datetime: function () {
        if (!this.imgs) { return '' };
        var d = this.imgs[this.res][this.slider].substr(0, 13);
        var md = moment.utc(d, 'YYYYMMDD/HHmm').tz('Asia/Jerusalem');
        return md
      },
      date: function () {
        if (!this.imgs) { return '' };
        return this.datetime.format('YYYY-MM-DD');
      },
      time: function () {
        if (!this.imgs) { return '' };
        return this.datetime.format('HH:mm');
      }
    },
    mounted: function () {
      var vm = this;
      axios.get('/imgs').then((res) => {
        vm.imgs = res.data;
        if (vm.mapLoaded) {
          vm.loadSources();
        }
      })
    },
    created: function () {
      this.initMap();
    },
    methods: {
      initMap: function() {
        var vm = this;
        this.map.on('style.load', function () {
          vm.mapLoaded = true;
          if (vm.imgs) {
            vm.loadSources();
          }
        });
        this.map.on('zoom', function () {
          var zoomIn = vm.map.getZoom() > 7;
          var from = zoomIn ? '280' : '140';
          var to = zoomIn ? '140' : '280';
          if (to != vm.res) {
            vm.hideRadarLayer(from, vm.slider);
            vm.showRadarLayer(to, vm.slider);
            vm.res = to;
          }
        });
      },
      loadSources: function () {
        // sources are loaded either in mounted() or in after style load in initMap() depending on which happened last
        var vm = this;
        var i = 0;
        while (i < vm.imgs['140'].length) {
          vm.addRadarSource('140', i, vm.imgs['140'][i])
          vm.addRadarLayer('140', i++)
        }
        var i = 0;
        while (i < vm.imgs['280'].length) {
          vm.addRadarSource('280', i, vm.imgs['280'][i])
          vm.addRadarLayer('280', i++)
        }
        vm.showRadarLayer('280', 9)
      },
      addRadarSource: function(res, i, url) {
        this.map.addSource(`radar-${res}-${i}`, {
          type: 'image',
          url: '//imgs.geshem.space/' + url,
          coordinates: this.rasterCoords[res]
        })
      },
      addRadarLayer: function(res, i) {
        this.map.addLayer({
          id: `radar-${res}-${i}`,
          source: `radar-${res}-${i}`,
          type: 'raster',
          paint: {
            'raster-opacity': 0
          }
        })
      },
      showRadarLayer: function(res, i) {
        this.map.setPaintProperty(`radar-${res}-${i}`, 'raster-opacity', 0.85);
      },
      hideRadarLayer: function(res, i) {
        this.map.setPaintProperty(`radar-${res}-${i}`, 'raster-opacity', 0);
      },
      removeRadarLayer: function(res, i) {
        this.map.removeLayer(`radar-${res}-${i}`)
      }
    },
    watch: {
      slider: function (to, from) {
        this.hideRadarLayer(this.res, from);
        this.showRadarLayer(this.res, to);
      }
    }
  }
</script>

<style lang="scss">
  #geshem {
    #datetime {
      position: absolute;
      margin: 20px 0px 0px 20px;
      color: white;
      font-family: monospace;
      #date {
        font-size: 1.4em;
      }
      #time {
        font-size: 1.8em;
      }
    }
    #slider {
      position: absolute;
      bottom: 8vh;
      width: 30vw;
      margin-left: 35vw;
      @media only screen and (max-device-width: 812px) {
        width: 80vw;
        margin-left: 8vw;
      }
    }
  }
</style>
