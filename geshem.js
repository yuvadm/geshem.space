import mapboxgl from 'mapbox-gl';
import Vue from 'vue';
import Geshem from './Geshem.vue';

mapboxgl.accessToken = 'pk.eyJ1IjoieXV2YWRtIiwiYSI6ImNpcnMxbzBuaTAwZWdoa25oczlzZmkwbHcifQ.UHtLngbKm9O8945pJm23Nw';

var vm = new Vue({
  el: '#app',
  render: h => h(Geshem)
});
