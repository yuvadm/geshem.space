"use client"

import React, { useState, useEffect } from "react";
// import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Map } from "./Map";
import { Slider } from "./Slider";
import { DateTime } from "./Datetime";
import { IMAGES_BASE_URL, PLAYBACK_HOURS, PLAYBACK_SLOTS } from "./config";

import "rc-slider/assets/index.css";

export function Geshem() {
  const [images, setImages] = useState<string[]>([]);
  const [fragment, setFragment] = useState<string | undefined>(undefined);
  const [slider, setSlider] = useState(fragment ? PLAYBACK_SLOTS : 9);

  useEffect(() => {
    const fetchImages = async () =>
      fetch(`${IMAGES_BASE_URL}/imgs.json`)
        .then(res => res.json())
        .then(imgs => imgs["280"])
        .then(setImages);

    const buildPlayback = async () => {
      const date = fragment;
      const hours = Array.from(Array(PLAYBACK_HOURS).keys()).map(
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

    let timer: NodeJS.Timeout;
    if (fragment) buildPlayback();
    else {
      fetchImages();
      timer = setInterval(fetchImages, 60 * 1000);
    }

    return () => {
      if (timer !== undefined) clearInterval(timer);
    };
  }, [fragment]);

  useEffect(() => {
    const fragment = window.location.hash.slice(1);
    setFragment(fragment);

    const handleHashChange = () => {
      const newFragment = window.location.hash.slice(1);
      setFragment(newFragment);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <>
      <Map images={images} slider={slider} />
      <DateTime images={images} slider={slider} />
      <Slider slider={slider} playback={fragment} setSlider={setSlider} />
    </>
  );
}
