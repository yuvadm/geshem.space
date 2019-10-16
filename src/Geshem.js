import React, { useState, useEffect, Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { DateTime } from "luxon";
import axios from "axios";

import Map from "./Map";
import Slider from "./Slider";
import { IMAGES_BASE_URL } from "./config";

import "./Geshem.css";
import "rc-slider/assets/index.css";

function App() {
  return (
    <Router>
      <Route exact path="/" component={Geshem} />
      <Route path="/history/:date" component={Geshem} />
    </Router>
  );
}

function Geshem(props) {
  const [images, setImages] = useState([]);
  const [playback, setPlayback] = useState(
    props.match.params.date || window.location.search.slice(-8) || false
  );
  const [slider, setSlider] = useState(playback ? 143 : 9);

  useEffect(() => {
    const fetchImages = async () => {
      const res = await fetch(`${IMAGES_BASE_URL}/imgs.json`);
      const imgs = await res.json();
      setImages(imgs["280"]);
    };
    fetchImages();
  }, []);

  return (
    <>
      <Map images={images} slider={slider} />
      <div id="slider">
        <Slider slider={slider} playback={playback} setSlider={setSlider} />
      </div>
    </>
  );
}

class OldGeshem extends Component {
  getGeolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { longitude, latitude } = pos.coords;
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
      });
    }
  }

  loadPlaybackData() {
    const date = this.state.playback;
    const hours = [...Array(24).keys()].map(
      h => `${String(h).padStart(2, "0")}`
    );
    const minutes = [...Array(6).keys()].map(
      m => `${String(m * 10).padStart(2, "0")}`
    );
    const paths = hours.reduce(
      (acc, h) => acc.concat(minutes.map(m => `imgs/${date}/${h}${m}/280.png`)),
      []
    );
    this.setState({
      imgs: { "280": paths }
    });
    if (this.state.mapLoaded) {
      this.loadSources();
    }
  }

  showRadarLayer(res, i) {
    this.map.setPaintProperty(`radar-${res}-${i}`, "raster-opacity", 0.85);
  }

  hideRadarLayer(res, i) {
    this.map.setPaintProperty(`radar-${res}-${i}`, "raster-opacity", 0);
  }

  removeRadarLayer(res, i) {
    this.map.removeLayer(`radar-${res}-${i}`);
  }

  onChangeSlider(val) {
    this.hideRadarLayer(this.state.res, this.state.slider);
    this.setState({ slider: val });
    this.showRadarLayer(this.state.res, val);
  }

  initMap() {
    const { lng, lat, zoom } = this.state;

    this.map.on("style.load", () => {
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
    } else {
      this.loadRadarData();
    }
    this.initMap();
  }

  getDateTime() {
    const { imgs, res, slider } = this.state;

    if (imgs === null) {
      return null;
    }

    const ds = imgs[res][slider].substr(5, 13);
    return DateTime.fromFormat(ds, "yyyyMMdd/HHmm", { zone: "utc" }).setZone(
      "Asia/Jerusalem"
    );
  }

  render() {
    const datetime = this.getDateTime();
    const date = datetime ? datetime.toFormat("dd-MM-y") : "";
    const time = datetime ? datetime.toFormat("HH:mm") : "";

    return (
      <div id="geshem">
        <div
          id="map"
          ref={el => (this.mapContainer = el)}
          className="absolute top right left bottom"
        />
        <div id="datetime">
          <div id="date">{date}</div>
          <div id="time">{time}</div>
        </div>
      </div>
    );
  }
}

export default App;
