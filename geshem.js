import React from 'react'
import ReactDOM from 'react-dom'

import 'rc-slider/assets/index.css'
import Slider from 'rc-slider'

// Need to directly script-load instead of proper import since GL JS doesn't support webpack
// https://github.com/mapbox/mapbox-gl-js/issues/1649
require('script!mapbox-gl/dist/mapbox-gl.js')

import './style.scss'

class GLMap extends React.Component {

  // Adapted from Tim Welch's code that can be found at
  // https://github.com/twelch/react-mapbox-gl-seed/blob/4d78eb0/src/components/GLMap.js

  static propTypes = {
    view: React.PropTypes.object,  // default map view
    token: React.PropTypes.string  // mapbox auth token
  }

  componentDidMount () {
    mapboxgl.accessToken = this.props.token

    this.map = new mapboxgl.Map(this.props.view)
    this.map.on('style.load', () => {
      this.map.addSource('radar-140', {
        "type": "image",
          "url": "/static/img/20160101_103000_140.png",
          "coordinates": [
            [33.35317413, 33.27232471],
            [36.32243686, 33.27232471],
            [36.32243686, 30.72293428],
            [33.35317413, 30.72293428]
          ]
      })
      this.map.addSource('radar-280', {
        "type": "image",
        "url": "/static/img/20160101_103000_280.png",
        "coordinates": [
          [31.93095218, 34.5156862],
          [37.86644267, 34.5156862],
          [37.86644267, 29.42911589],
          [31.93095218, 29.42911589]
        ]
      })

      this.map.addLayer({
        "id": "radar-140",
        "source": "radar-140",
        "type": "raster",
        "paint": {
            "raster-opacity": 0.85
        },
        "layout": {
            "visibility": "none"
        }
      })
      this.map.addLayer({
        "id": "radar-280",
        "source": "radar-280",
        "type": "raster",
        "paint": {
            "raster-opacity": 0.85
        }
      })
    })
  }

  componentWillUnmount () {
    this.map.remove()
  }

  render () {
    return <div id='map'></div>
  }

}

class Map extends React.Component {
  render () {
    var mapStyle = {
        "version": 8,
        "name": "Dark",
        "sources": {
            "mapbox": {
                "type": "vector",
                "url": "mapbox://mapbox.mapbox-streets-v6"
            }
        },
        "sprite": "mapbox://sprites/mapbox/dark-v8",
        "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
        "layers": [
            {
                "id": "background",
                "type": "background",
                "paint": {"background-color": "#111"}
            },
            {
                "id": "boundaries",
                "source": "mapbox",
                "source-layer": "admin",
                "type": "line",
                "paint": {"line-color": "#797979"},
                "filter": ["all", ["<=", "admin_level", 2], ['==', 'maritime', 0]]
            },
            {
                "id": "water",
                "source": "mapbox",
                "source-layer": "water",
                "type": "line",
                "paint": {"line-color": "#797979"}
            },
            {
                "id": "water2",
                "source": "mapbox",
                "source-layer": "water",
                "type": "fill",
                "paint": {"fill-color": "#111122"}
            },
            {
                "id": "cities",
                "source": "mapbox",
                "source-layer": "place_label",
                "type": "symbol",
                "filter": ["all", ["<=", "localrank", 6]],
                "layout": {
                    "text-field": "{name_en}",
                    "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
                    "text-size": {"stops": [[4, 9], [6, 12]]}
                },
                "paint": {
                    "text-color": "#969696",
                    "text-halo-width": 2,
                    "text-halo-color": "rgba(0, 0, 0, 0.85)"
                }
            },
            {
                "id": "states",
                "source": "mapbox",
                "source-layer": "state_label",
                "type": "symbol",
                "layout": {
                    "text-transform": "uppercase",
                    "text-field": "{name_en}",
                    "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
                    "text-letter-spacing": 0.15,
                    "text-max-width": 7,
                    "text-size": {"stops": [[4, 10], [6, 14]]}
                },
                "filter": [">=", "area", 80000],
                "paint": {
                    "text-color": "#969696",
                    "text-halo-width": 2,
                    "text-halo-color": "rgba(0, 0, 0, 0.85)"
                }
            }
        ]
    }
    const view = {
        container: 'map',
        maxZoom: 10,
        minZoom: 5,
        zoom: 6.3,
        center: [35, 31.9],
        style: mapStyle,
        hash: false
    }
    return <div>
      <GLMap
        view={view}
        token='pk.eyJ1IjoieXV2YWRtIiwiYSI6ImNpaWRuaWFxazAwMTJ2b2tyZGRmaWpsNWYifQ.qf_V3CFP_NZtLjk5luNM4g' />
      <Slider step={2} defaultValue={50} />
    </div>
  }
}

ReactDOM.render(<Map/>, document.getElementById('root'))
