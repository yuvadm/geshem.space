import React, { useState, useEffect } from "react";

import { Map } from "./Map";
import { Slider } from "./Slider";
import { DateTime } from "./Datetime";

import { IMAGES_BASE_URL, PLAYBACK_HOURS, PLAYBACK_SLOTS } from "../config";

interface GeshemProps {
  date?: string;
}

export function Geshem({ date }: GeshemProps) {
  const [images, setImages] = useState<string[]>([]);
  const [playback] = useState(
    date ||
    (typeof window !== 'undefined' ? new URL(window.location.toString()).searchParams.get("history") : null) ||
    undefined
  );
  const [slider, setSlider] = useState(playback ? PLAYBACK_SLOTS : 9);

  useEffect(() => {
    const fetchImages = async () =>
      fetch(`${IMAGES_BASE_URL}/imgs/`)
        .then(res => res.json())
        .then(data => data.images.map((img: any) => img.path))
        .then(setImages);

    const buildPlayback = async () => {
      const date = playback;
      const hours = Array.from(Array(PLAYBACK_HOURS).keys()).map(
        h => `${String(h).padStart(2, "0")}`
      );
      const minutes = Array.from(Array(6).keys()).map(
        m => `${String(m * 10).padStart(2, "0")}`
      );
      const paths = hours.reduce<string[]>(
        (acc, h) =>
          acc.concat(minutes.map(m => `imgs/${date}/${h}${m}/gis.png`)),
        []
      );
      setImages(paths);
    };

    let timer: number;
    if (playback) {
      buildPlayback();
    } else {
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