import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Map from "./Map";
import Slider from "./Slider";
import DateTime from "./Datetime";

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
  const [playback] = useState(
    props.match.params.date || new URL(window.location).searchParams.get('history') || false
  )
  const [slider, setSlider] = useState(playback ? 143 : 9);

  useEffect(() => {
    const fetchImages = async () =>
      fetch(`${IMAGES_BASE_URL}/imgs.json`)
        .then(res => res.json())
        .then(imgs => imgs['280'])
        .then(setImages)
    )

    const buildPlayback = async () => setImages(
      Array(24*6)
        .fill('')
        .map((_,i) => `imgs/${playback}/${`${parseInt(i/6, 10)%24}`.padStart(2, '0')}${i%6}0/280.png`)
    )

    return playback ?
      (buildPlayback(), () => void 0) :
      (fetchImages(), ((timer) => () => clearTimer(timer))(setInterval(fetchImages, 60 * 1000))

  }, [playback])

  return (
    <>
      <Map images={images} slider={slider} />
      <DateTime images={images} slider={slider} />
      <Slider slider={slider} playback={playback} setSlider={setSlider} />
    </>
  )
}

function getGeolocation() {
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

export default App;
