<template>
  <div id="geshem">
    <div id="datetime">
      <div id="date">{{ date }}</div>
      <div id="time">{{ time }}</div>
    </div>
    <div id="slider">
      <vue-slider ref="slider" v-model="slider" :min=1 :max=7 :height=20 :dot-size=45 :tooltip=false></vue-slider>
    </div>
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
    computed: {
      date: function () {
        var d = this.imgs[this.res][7-this.slider].substr(0, 8);
        return `${d.substr(6, 2)}-${d.substr(4, 2)}-${d.substr(0, 4)}`;
      },
      time: function () {
        var t = this.imgs[this.res][7-this.slider].substr(9, 6);
        return `${t.substr(0, 2)}:${t.substr(2, 2)}`;
      },
      curImg: function () {
        return 7 - this.slider;
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
      });
      this.map.on('zoom', function () {
        var zoomIn = vm.map.getZoom() > 7;
        var from = zoomIn ? '280' : '140';
        var to = zoomIn ? '140' : '280';
        if (to != vm.res) {
          console.log(`Zoom event from ${from} to ${to}`);
          vm.removeRadarLayer(from, vm.curImg);
          vm.addRadarLayer(to, vm.curImg);
          vm.res = to;
        }
      });
    },
    methods: {
      addRadarSource: function(res, i, url) {
        this.map.addSource(`radar-${res}-${i}`, {
          type: 'image',
          url: '/static/img/' + url,
          coordinates: this.rasterCoords[res]
        })
      },
      addRadarLayer: function(res, i) {
        this.map.addLayer({
          id: `radar-${res}-${i}`,
          source: `radar-${res}-${i}`,
          type: 'raster',
          paint: {
            'raster-opacity': 0.85
          }
        })
      },
      removeRadarLayer: function(res, i) {
        this.map.removeLayer(`radar-${res}-${i}`)
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
