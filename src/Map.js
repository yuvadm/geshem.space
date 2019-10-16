import React, { Fragment, useState } from "react";
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
  const [center] = useState([35, 31.9]);
  const [zoom] = useState([6.3]);

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
          <Fragment key={`image-${id}`}>
            <Source
              id={id}
              key={`source-${id}`}
              tileJsonSource={{
                type: "image",
                url: img,
                coordinates: IMAGE_COORDINATES
              }}
            />
            <Layer
              id={id}
              key={`layer-${id}`}
              sourceId={id}
              type="raster"
              paint={{
                "raster-opacity": i == props.slider ? 1 : 0,
                "raster-opacity-transition": {
                  duration: 0
                }
              }}
            />
          </Fragment>
        );
      })}
    </Mapbox>
  );
}

export default Map;
