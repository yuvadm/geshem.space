import React, { useState, useEffect } from 'react';
import ReactMapboxGl, { Layer, Source } from 'react-mapbox-gl';

import { IMAGES_BASE_URL, MAPBOX_ACCESS_TOKEN, IMAGE_COORDINATES } from './config';

import 'mapbox-gl/dist/mapbox-gl.css';


const Mapbox = ReactMapboxGl({
  accessToken: MAPBOX_ACCESS_TOKEN,
  minZoom: 5,
  maxZoom: 10,
  hash: false,
});

function Map() {
  const [center, setCenter] = useState([35, 31.9]);
  const [zoom, setZoom] = useState([6.3]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async() => {
      const res = await fetch(`${IMAGES_BASE_URL}/imgs.json`);
      const imgs = await res.json();
      setImages(imgs["280"]);
    };
    fetchImages();
  }, []);

  return (
    <Mapbox style="mapbox://styles/mapbox/dark-v9" center={center} zoom={zoom}
      containerStyle={{
        height: '100vh',
        width: '100vw'
      }}
    >
      {images.map((img, i) => (
        <>
          <Source id={`radar-280-${i}`} tileJsonSource={{
            "type": "image",
            "url": img,
            "coordinates": IMAGE_COORDINATES
          }}/>
          <Layer id={`radar-280-${i}`} sourceId={`radar-280-${i}`} type="raster" paint={{
            'raster-opacity': i==0 ? 1 : 0,
            'raster-opacity-transition': {
              'duration': 0
            }
          }}/>
        </>
      ))}
    </Mapbox>
  );
}

export default Map;
