import React, { Component } from 'react';
import Slider from 'rc-slider';
import { DateTime } from 'luxon';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';

import './Geshem.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'rc-slider/assets/index.css';

mapboxgl.accessToken = 'pk.eyJ1IjoieXV2YWRtIiwiYSI6ImNpcnMxbzBuaTAwZWdoa25oczlzZmkwbHcifQ.UHtLngbKm9O8945pJm23Nw';

const IMGS_BASE_URL = 'https://imgs.geshem.space/'


class Geshem extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mapLoaded: false,
      imgs: null,
      res: 280,
      slider: 9,
      lng: 35,
      lat: 31.9,
      zoom: 6.3,
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
    };
  }

  loadSources() {
    const { imgs } = this.state;
    let i = 0;
    while (i < imgs['140'].length) {
      this.addRadarSource('140', i, imgs['140'][i])
      this.addRadarLayer('140', i++)
    }
    i = 0;
    while (i < imgs['280'].length) {
      this.addRadarSource('280', i, imgs['280'][i])
      this.addRadarLayer('280', i++)
    }
    this.showRadarLayer('280', 9)
  }

  loadRadarData() {
    axios({
      url: IMGS_BASE_URL + 'imgs.json',
      method: 'get',
    }).then((res) => {
      this.setState({
        imgs: res.data
      })
      if (this.state.mapLoaded) {
        this.loadSources();
      }
    }).catch(function(error) {
      console.log(error)
    })
  }

  addRadarSource(res, i, url) {
    this.map.addSource(`radar-${res}-${i}`, {
      type: 'image',
      url: IMGS_BASE_URL + url,
      coordinates: this.state.rasterCoords[res]
    })
  }

  addRadarLayer(res, i) {
    this.map.addLayer({
      id: `radar-${res}-${i}`,
      source: `radar-${res}-${i}`,
      type: 'raster',
      paint: {
        'raster-opacity': 0,
        'raster-opacity-transition': {
          'duration': 0
        }
      }
    })
  }

  showRadarLayer(res, i) {
    this.map.setPaintProperty(`radar-${res}-${i}`, 'raster-opacity', 0.85);
  }

  hideRadarLayer(res, i) {
    this.map.setPaintProperty(`radar-${res}-${i}`, 'raster-opacity', 0);
  }

  removeRadarLayer(res, i) {
    this.map.removeLayer(`radar-${res}-${i}`)
  }

  onChangeSlider(val) {
    this.hideRadarLayer(this.state.res, this.state.slider);
    this.setState({ slider: val });
    this.showRadarLayer(this.state.res, val);
  }

  initMap() {
    const { lng, lat, zoom } = this.state;

    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/dark-v9',
      maxZoom: 10,
      minZoom: 5,
      center: [lng, lat],
      zoom: zoom,
      hash: false
    });

    this.map.on('style.load', () => {
      this.setState({
        mapLoaded: true
      });
      if (this.state.imgs !== null) {
        this.loadSources();
      }
    });

    this.map.on('zoom', () => {
      const zoomIn = this.map.getZoom() > 7;
      const from = zoomIn ? '280' : '140';
      const to = zoomIn ? '140' : '280';
      if (to !== this.state.res) {
        this.hideRadarLayer(from, this.state.slider);
        this.showRadarLayer(to, this.state.slider);
        this.setState({ res: to });
      }
    });
  }

  componentDidMount() {
    this.loadRadarData();
    this.initMap();
  }

  getDateTime() {
    const {imgs, res, slider} = this.state;

    if (imgs === null) {
      return null;
    }

    const ds = imgs[res][slider].substr(5, 13);
    return DateTime.fromFormat(ds, 'yyyyMMdd/HHmm', {zone: 'utc'}).setZone('Asia/Jerusalem');
  }

  render() {
    const handleStyle = {
      height: 40,
      width: 40,
      border: 0,
      marginTop: -10,
      marginLeft: -20,
      boxShadow: '.5px .5px 2px 1px rgba(0,0,0,.32)'
    }

    const railStyle = {
      height: 20,
      backgroundColor: '#3498db'
    }

    const trackStyle={
      display: 'none'
    }

    const datetime = this.getDateTime();
    console.log(datetime);
    const date = datetime ? datetime.toFormat('y-MM-dd') : '';
    const time = datetime ? datetime.toFormat('HH:mm') : '';

    return (
      <div id="geshem">
        <div id="map" ref={el => this.mapContainer = el} className="absolute top right left bottom" />
        <div id="datetime">
          <div id="date">{ date }</div>
          <div id="time">{ time }</div>
        </div>
        <div id="slider">
          <Slider mix={0} max={9} defaultValue={this.state.slider} handleStyle={handleStyle}
            railStyle={railStyle} trackStyle={trackStyle} onChange={(val) => this.onChangeSlider(val)}/>
        </div>
      </div>
    );
  }
}

export default Geshem;
