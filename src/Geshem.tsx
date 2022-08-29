import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Map from "./Map";
import Slider from "./Slider";
import DateTime from "./Datetime";

import { IMAGES_BASE_URL } from "./config";

import "./Geshem.css";
import "rc-slider/assets/index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Geshem />} />
        <Route path="/history/:date" element={<Geshem />} />
      </Routes>
    </BrowserRouter>
  );
}

interface GeshemProps {
  date?: string
}

function Geshem({ date }: GeshemProps) {
  const [images, setImages] = useState<string[]>([]);
  const [playback] = useState(
    date ||
    new URL(window.location.toString()).searchParams.get("history") ||
    undefined
  );
  const [slider, setSlider] = useState(playback ? 143 : 9);

  useEffect(() => {
    const fetchImages = async () =>
      fetch(`${IMAGES_BASE_URL}/imgs.json`)
        .then(res => res.json())
        .then(imgs => imgs["280"])
        .then(setImages);

    const buildPlayback = async () => {
      const date = playback;
      const hours = Array.from(Array(24).keys()).map(
        h => `${String(h).padStart(2, "0")}`
      );
      const minutes = Array.from(Array(6).keys()).map(
        m => `${String(m * 10).padStart(2, "0")}`
      );
      const paths = hours.reduce<string[]>(
        (acc, h) =>
          acc.concat(minutes.map(m => `imgs/${date}/${h}${m}/280.png`)),
        []
      );
      setImages(paths);
    };

    let timer: number;
    if (playback) buildPlayback();
    else {
      fetchImages();
      timer = window.setInterval(fetchImages, 60 * 1000);
    }

    return () => {
      if (timer !== undefined) clearInterval(timer);
    };
  }, [playback]);

  return (
    <>
      <Map images={images} slider={slider} />
      <DateTime images={images} slider={slider} />
      <Slider slider={slider} playback={playback} setSlider={setSlider} />
    </>
  );
}

export default App;
