import React, { useState, useEffect } from "react";
import ReactMapboxGl, { Layer, Source } from "react-mapbox-gl";

import { MAPBOX_ACCESS_TOKEN, IMAGE_COORDINATES } from "./config";

import "mapbox-gl/dist/mapbox-gl.css";

const Mapbox = ReactMapboxGl({
  accessToken: MAPBOX_ACCESS_TOKEN,
  minZoom: 5,
  maxZoom: 10,
  hash: false
});

function Map(props) {
  const [center, setCenter] = useState([35, 31.9]);
  const [zoom, setZoom] = useState([6.3]);

  return (
    <Mapbox
      style="mapbox://styles/mapbox/dark-v9"
      center={center}
      zoom={zoom}
      containerStyle={{
        height: "100vh",
        width: "100vw"
      }}
    >
      {props.images.map((img, i) => {
        const id = `radar-280-${i}`;
        return (
          <>
            <Source
              id={id}
              tileJsonSource={{
                type: "image",
                url: img,
                coordinates: IMAGE_COORDINATES
              }}
            />
            <Layer
              id={id}
              sourceId={id}
              type="raster"
              paint={{
                "raster-opacity": i == 0 ? 1 : 0,
                "raster-opacity-transition": {
                  duration: 0
                }
              }}
            />
          </>
        );
      })}
    </Mapbox>
  );
}

export default Map;
