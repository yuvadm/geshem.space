import React, { useState } from 'react';
import ReactMapboxGl, { Layer, Feature } from 'react-mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoieXV2YWRtIiwiYSI6ImNpcnMxbzBuaTAwZWdoa25oczlzZmkwbHcifQ.UHtLngbKm9O8945pJm23Nw';

const Mapbox = ReactMapboxGl({
  accessToken: MAPBOX_ACCESS_TOKEN,
  minZoom: 5,
  maxZoom: 10,
  hash: false,
});

function Map() {
  const [center, setCenter] = useState([35, 31.9]);
  const [zoom, setZoom] = useState([6.3]);

  return (
    <Mapbox style="mapbox://styles/mapbox/dark-v9" center={center} zoom={zoom}
      containerStyle={{
        height: '100vh',
        width: '100vw'
      }}
    ></Mapbox>
  );
}

export default Map;
