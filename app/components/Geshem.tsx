"use client"

import React, { useState, useEffect } from "react";

import { Map } from "./Map";
import { Slider } from "./Slider";
import { DateTime } from "./Datetime";
import Fathom from "./Fathom";

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
      if (fragment === undefined) return;
      const date = fragment.slice(0, 8);
      const startHour = parseInt(fragment.slice(8, 10)) || 9;
      const startMinute = parseInt(fragment.slice(10, 12)) || 0;

      const generateTimeSlots = (start: number): string[] => {
        const slots = [];
        for (let i = 0; i < PLAYBACK_HOURS * 6; i++) {
          const minutes = (start + i * 10) % 60;
          const hours = (startHour + Math.floor((start + i * 10) / 60)) % 24;
          slots.push(`${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}`);
        }
        return slots;
      };

      const timeSlots = generateTimeSlots(startMinute);
      const paths = timeSlots.map(slot => `imgs/${date}/${slot}/280.png`);

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
      <Fathom />
      <Map images={images} slider={slider} />
      <DateTime images={images} slider={slider} />
      <Slider slider={slider} playback={fragment} setSlider={setSlider} />
    </>
  );
}
