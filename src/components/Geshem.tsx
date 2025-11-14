import React, { useState, useEffect, useRef } from "react";

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
  const [slider, setSlider] = useState(0);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const fetchImages = async () =>
      fetch(`/imgs/`)
        .then(res => res.json())
        .then(data => (data as any).images.map((img: any) => img.path))
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

  // Update slider to point to the latest image when images change
  useEffect(() => {
    if (images.length > 0) {
      setSlider(prevSlider => {
        const maxIndex = playback ? PLAYBACK_SLOTS : images.length - 1;

        // On initial load, set to the latest image (rightmost)
        if (isInitialLoad.current) {
          isInitialLoad.current = false;
          return maxIndex;
        }

        // If slider is out of bounds (e.g., after image count changes), clamp it
        if (prevSlider > maxIndex) {
          return maxIndex;
        }

        return prevSlider;
      });
    }
  }, [images.length, playback]);

  return (
    <>
      <Map images={images} slider={slider} />
      <DateTime images={images} slider={slider} />
      <Slider slider={slider} playback={playback} setSlider={setSlider} imageCount={images.length} />
    </>
  );
}