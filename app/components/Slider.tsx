import React from "react";
import RcSlider, { SliderProps, SliderRef } from 'rc-slider/lib/Slider';
import { PLAYBACK_SLOTS } from "./config";

// use workaround from: https://github.com/react-component/slider/issues/835#issuecomment-1201805736
const CustomSlider = RcSlider as React.ForwardRefExoticComponent<SliderProps<number> & React.RefAttributes<SliderRef>>;

interface GeshemSliderProps {
  playback?: string,
  slider: number,
  setSlider: React.Dispatch<React.SetStateAction<number>>
}

export function Slider({ playback, slider, setSlider }: GeshemSliderProps) {
  const handle = {
    height: 40,
    width: 40,
    border: 0,
    marginTop: -10,
    boxShadow: ".5px .5px 2px 1px rgba(0,0,0,.32)"
  };

  const rail = {
    height: 20,
    backgroundColor: "#3498db"
  };

  const track = {
    display: "none"
  };

  const styles = {
    handle, rail, track
  }

  return (
    <div id="slider" className="fixed bottom-16 w-9/12 sm:w-1/3 left-0 right-0 pr-5 mx-auto">
      <CustomSlider
        min={0}
        max={playback ? PLAYBACK_SLOTS : 9}
        defaultValue={slider}
        styles={styles}
        onChange={val => setSlider(val)}
      />
    </div>
  );
}
