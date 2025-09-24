import React from "react";
import RcSlider from 'rc-slider';
import { PLAYBACK_SLOTS } from "../config";
import "rc-slider/assets/index.css";

interface GeshemSliderProps {
  playback?: string;
  slider: number;
  setSlider: React.Dispatch<React.SetStateAction<number>>;
}

export function Slider({ playback, slider, setSlider }: GeshemSliderProps) {
  const handleStyle = {
    height: 40,
    width: 40,
    border: 0,
    marginTop: -10,
    boxShadow: ".5px .5px 2px 1px rgba(0,0,0,.32)"
  };

  const railStyle = {
    height: 20,
    backgroundColor: "#3498db"
  };

  const trackStyle = {
    display: "none"
  };

  return (
    <div id="slider">
      <RcSlider
        min={0}
        max={playback ? PLAYBACK_SLOTS : 9}
        defaultValue={slider}
        handleStyle={handleStyle}
        railStyle={railStyle}
        trackStyle={trackStyle}
        onChange={(val) => setSlider(val as number)}
      />
    </div>
  );
}