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

function Map({ slider, images }: MapProps) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [center] = useState<mapboxgl.LngLatLike>([35, 31.9]);
  const [zoom] = useState([6.3]);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      accessToken: MAPBOX_ACCESS_TOKEN,
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v9",
      center,
      zoom,
      minZoom: 5,
      maxZoom: 10,
      hash: false,
    });
  });

  return (
    <div>
      <div ref={mapContainer} className="map-container" style={{
        height: "100vh",
        width: "100vw"
      }} />
    </div>
  );

  // return (
  //   <Mapbox >
  //     {images.map((img, i) => {
  //       const id = `radar-280-${i}`;
  //       return (
  //         <Fragment key={`image-${id}`}>
  //           {/* <Source
  //             id={id}
  //             key={`source-${id}`}
  //             tileJsonSource={{
  //               type: "image",
  //               url: `${IMAGES_BASE_URL}/${img}`,
  //               coordinates: IMAGE_COORDINATES
  //             }}
  //           />
  //           <Layer
  //             id={id}
  //             key={`layer-${id}`}
  //             sourceId={id}
  //             type="raster"
  //             paint={{
  //               "raster-opacity": i === slider ? 0.85 : 0,
  //               "raster-opacity-transition": {
  //                 duration: 0
  //               }
  //             }}
  //           /> */}
  //         </Fragment>
  //       );
  //     })}
  //   </Mapbox>
  // );
}

export default Map;
