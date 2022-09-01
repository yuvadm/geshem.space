import React, { useState, useEffect, useRef } from "react";
// @ts-ignore
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

import {
  MAPBOX_ACCESS_TOKEN,
  IMAGE_COORDINATES,
  IMAGES_BASE_URL
} from "./config";

import "mapbox-gl/dist/mapbox-gl.css";

interface MapProps {
  slider: number,
  images: string[],
}

export function Map({ slider, images }: MapProps) {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map>(null);

  const [lng, setLng] = useState(35);
  const [lat, setLat] = useState(31.9);
  const [zoom, setZoom] = useState(6.3);
  const [loaded, setLoaded] = useState(false);

  const prevImages = useRef(images).current;

  useEffect(() => {
    if (map.current) return;

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

    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    })
  });

  useEffect(() => {
    if (!loaded) return;

    // remove old layers
    prevImages.forEach((img) => {
      if (!images.includes(img)) {
        map.current.removeLayer(`layer-${img}`);
        map.current.removeSource(`source-${img}`);
      }
    });

    // add new layers
    images.forEach((img, i) => {
      if (!prevImages.includes(img) && !map.current.getSource(`source-${img}`)) {
        map.current.addSource(`source-${img}`, {
          type: "image",
          url: `${IMAGES_BASE_URL}/${img}`,
          coordinates: IMAGE_COORDINATES
        });
        map.current.addLayer({
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
    if (!loaded) return;
    images[slider] && map.current.setPaintProperty(`layer-${images[slider]}`, "raster-opacity", 0.85);
    return () => {
      // callback will hide the previous layer with the previous slider value
      map.current.setPaintProperty(`layer-${images[slider]}`, "raster-opacity", 0);
    }
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
