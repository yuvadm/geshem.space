import React, { useState, Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom"
;
import Slider from 'rc-slider';
import { DateTime } from 'luxon';
import axios from 'axios';

import mapboxgl from 'mapbox-gl';
import ReactMapboxGl, { Layer, Feature } from 'react-mapbox-gl';

import './Geshem.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'rc-slider/assets/index.css';

const Map = ReactMapboxGl({
  accessToken:
    'pk.eyJ1IjoieXV2YWRtIiwiYSI6ImNpcnMxbzBuaTAwZWdoa25oczlzZmkwbHcifQ.UHtLngbKm9O8945pJm23Nw',
  minZoom: 5,
  maxZoom: 10,
  hash: false,
});

const IMGS_BASE_URL = 'https://imgs.geshem.space/'


function App() {
  return (
    <Router>
      <Route exact path="/" component={Geshem} />
      <Route path="/history/:date" component={Geshem} />
    </Router>
  );
}

function Geshem() {
  const [center, setCenter] = useState([35, 31.9]);
  const [zoom, setZoom] = useState([6.3]);

  return (
    <Map style="mapbox://styles/mapbox/dark-v9" center={center} zoom={zoom}
      containerStyle={{
        height: '100vh',
        width: '100vw'
      }}
    ></Map>
  );
}

class OldGeshem extends Component {

  constructor(props) {
    super(props);
    const playback = props.match.params.date || window.location.search.slice(-8) || false;
    this.state = {
      mapLoaded: false,
      imgs: null,
      playback: playback,
      res: 280,
      slider: playback ? 143 : 9,
      lng: 35,
      lat: 31.9,
      zoom: 6.3,
      rasterCoords: {
        280: [
          [31.7503896894, 34.4878044232],
          [37.8574239563, 34.5078463729],
          [37.7157066403, 29.4538271687],
          [31.9347389087, 29.4373462909]
        ]
      },
    };
  }

  getGeolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const {longitude, latitude} = pos.coords;
        this.setState({
          lng: longitude,
          lat: latitude,
          zoom: 11
        });
        if (this.state.mapLoaded) {
          this.map.jumpTo({
            center: [longitude, latitude],
            zoom: 11
          });
        }
      })
    }
  }

  loadSources() {
    const { imgs } = this.state;
    let i = 0;
    while (i < imgs['280'].length) {
      this.addRadarSource('280', i, imgs['280'][i])
      this.addRadarLayer('280', i++)
    }
    this.showRadarLayer('280', 9)
  }

  loadPlaybackData() {
    const date = this.state.playback;
    const hours = [...Array(24).keys()].map(h => `${String(h).padStart(2, '0')}`);
    const minutes = [...Array(6).keys()].map(m => `${String(m * 10).padStart(2, '0')}`);
    const paths = hours.reduce((acc, h) => acc.concat(
      minutes.map(
        m => `imgs/${date}/${h}${m}/280.png`
      )
    ), []);
    this.setState({
      imgs: {'280': paths}
    });
    if (this.state.mapLoaded) {
      this.loadSources();
    }
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

    this.map.on('style.load', () => {
      this.setState({
        mapLoaded: true
      });
      if (this.state.imgs !== null) {
        this.loadSources();
      }
    });
  }

  componentDidMount() {
    // this.getGeolocation();
    if (this.state.playback) {
      this.loadPlaybackData();
    }
    else {
      this.loadRadarData();
    }
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
    const date = datetime ? datetime.toFormat('dd-MM-y') : '';
    const time = datetime ? datetime.toFormat('HH:mm') : '';

    return (
      <div id="geshem">
        <div id="map" ref={el => this.mapContainer = el} className="absolute top right left bottom" />
        <div id="datetime">
          <div id="date">{ date }</div>
          <div id="time">{ time }</div>
        </div>
        <div id="slider">
          <Slider mix={0} max={this.state.playback ? 143 : 9} defaultValue={this.state.slider} handleStyle={handleStyle}
            railStyle={railStyle} trackStyle={trackStyle} onChange={(val) => this.onChangeSlider(val)}/>
        </div>
      </div>
    );
  }
}

export default App;
