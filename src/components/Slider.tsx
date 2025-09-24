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

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    updateSliderValue(e);
  }, []);

  const updateSliderValue = useCallback((e: MouseEvent | React.MouseEvent | TouchEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    let clientX: number;
    
    if ('touches' in e) {
      clientX = e.touches?.[0]?.clientX || (e as TouchEvent).changedTouches?.[0]?.clientX || 0;
    } else {
      clientX = e.clientX;
    }
    
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const value = Math.round(percentage * max);
    setSlider(value);
  }, [max, setSlider]);

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      updateSliderValue(e);
    }
  }, [isDragging, updateSliderValue]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, handleMove, handleEnd]);

  const percentage = (slider / max) * 100;

  return (
    <div id="slider" className="py-2.5 fixed bottom-[8vh] w-[30vw] ml-[35vw] max-[812px]:w-[80vw] max-[812px]:ml-[8vw] max-[812px]:z-10">
      <div
        ref={sliderRef}
        className="relative h-5 bg-blue-500 rounded-full cursor-pointer touch-none"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
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