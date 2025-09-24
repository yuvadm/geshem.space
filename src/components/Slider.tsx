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
    <div id="slider" style={{ padding: '10px 0' }}>
      <div
        ref={sliderRef}
        style={{
          position: 'relative',
          height: '20px',
          backgroundColor: '#3498db',
          borderRadius: '10px',
          cursor: 'pointer'
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            left: `calc(${percentage}% - 20px)`,
            width: '40px',
            height: '40px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            boxShadow: '.5px .5px 2px 1px rgba(0,0,0,.32)',
            cursor: isDragging ? 'grabbing' : 'grab',
            zIndex: 1
          }}
        />
      </div>
    </div>
  );
}