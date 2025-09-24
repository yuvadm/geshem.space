import React, { useState, useEffect, useRef } from "react";
import mapboxgl from 'mapbox-gl';

import {
  MAPBOX_ACCESS_TOKEN,
  IMAGE_COORDINATES,
  IMAGES_BASE_URL
} from "../config";

import "mapbox-gl/dist/mapbox-gl.css";

interface MapProps {
  slider: number;
  images: string[];
}

export function Map({ slider, images }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [lng] = useState(35);
  const [lat] = useState(31.9);
  const [zoom] = useState(6.3);
  const [loaded, setLoaded] = useState(false);

  const prevImages = useRef(images).current;

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      accessToken: MAPBOX_ACCESS_TOKEN,
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v9",
      center: [lng, lat],
      zoom: zoom,
      minZoom: 5,
      maxZoom: 10,
      hash: false,
    });

    map.current.on("style.load", () => {
      setLoaded(true);
    });
  }, [lng, lat, zoom]);

  useEffect(() => {
    if (!loaded || !map.current) return;

    // remove old layers
    prevImages.forEach((img) => {
      if (!images.includes(img)) {
        if (map.current?.getLayer(`layer-${img}`)) {
          map.current.removeLayer(`layer-${img}`);
        }
        if (map.current?.getSource(`source-${img}`)) {
          map.current.removeSource(`source-${img}`);
        }
      }
    });

    // add new layers
    images.forEach((img, i) => {
      if (!prevImages.includes(img) && !map.current?.getSource(`source-${img}`)) {
        map.current?.addSource(`source-${img}`, {
          type: "image",
          url: `${IMAGES_BASE_URL}/${img}`,
          coordinates: IMAGE_COORDINATES
        });
        map.current?.addLayer({
          id: `layer-${img}`,
          source: `source-${img}`,
          type: "raster",
          paint: {
            "raster-opacity": 0,
            "raster-opacity-transition": {
              duration: 0
            }
          }
        });
      }
    });
  }, [loaded, prevImages, images]);

  useEffect(() => {
    if (!loaded || !images.length || !map.current) return;

    if (images[slider]) {
      map.current.setPaintProperty(`layer-${images[slider]}`, "raster-opacity", 0.85);
    }

    return () => {
      // callback will hide the previous layer with the previous slider value
      if (images[slider] && map.current?.getLayer(`layer-${images[slider]}`)) {
        map.current.setPaintProperty(`layer-${images[slider]}`, "raster-opacity", 0);
      }
    };
  }, [loaded, slider, images]);

  return (
    <div>
      <div ref={mapContainer} className="map-container" style={{
        height: "100vh",
        width: "100vw"
      }} />
    </div>
  );
}