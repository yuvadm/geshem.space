import React, { useCallback, useRef, useState } from "react";
import { PLAYBACK_SLOTS } from "../config";

interface SliderProps {
  playback?: string;
  slider: number;
  setSlider: React.Dispatch<React.SetStateAction<number>>;
}

export function Slider({ playback, slider, setSlider }: SliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const max = playback ? PLAYBACK_SLOTS : 9;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    updateSliderValue(e);
  }, []);

  const updateSliderValue = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const value = Math.round(percentage * max);
    setSlider(value);
  }, [max, setSlider]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      updateSliderValue(e);
    }
  }, [isDragging, updateSliderValue]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const percentage = (slider / max) * 100;

  return (
    <div id="slider" className="py-2.5 fixed bottom-[8vh] w-[30vw] ml-[35vw] max-[812px]:w-[80vw] max-[812px]:ml-[8vw] max-[812px]:z-10">
      <div
        ref={sliderRef}
        className="relative h-5 bg-blue-500 rounded-full cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        <div
          className={`absolute -top-2.5 w-10 h-10 bg-white rounded-full shadow-md z-[1] ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            left: `calc(${percentage}% - 20px)`
          }}
        />
      </div>
    </div>
  );
}