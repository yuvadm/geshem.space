import 'babel-polyfill'

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


  constructor (props) {
    super(props)
    this.state = {
      'res': '280',
      'slider': 0
    }
    this.RASTER_COORDS = {
      '140': [
        [33.35317413, 33.27232471],
        [36.32243686, 33.27232471],
        [36.32243686, 30.72293428],
        [33.35317413, 30.72293428]
      ],
      '280': [
        [31.93095218, 34.5156862],
        [37.86644267, 34.5156862],
        [37.86644267, 29.42911589],
        [31.93095218, 29.42911589]
      ]
    }
  }

  _addRadarSource (res, i, url) {
    this.map.addSource('radar-' + res + '-' + i, {
      "type": "image",
      "url": "/static/img/" + url,
      "coordinates": this.RASTER_COORDS[res]
    })
  }

  _addRadarLayer (res, i) {
    this.map.addLayer({
      "id": 'radar-' + res + '-' + i,
      "source": 'radar-' + res + '-' + i,
      "type": "raster",
      "paint": {
          "raster-opacity": 0.85
      }
    })
  }

  _removeRadarLayer (res, i) {
    this.map.removeLayer('radar-' + res + '-' + i)
  }

  componentDidMount () {
    mapboxgl.accessToken = this.props.token

    this.map = new mapboxgl.Map(this.props.view)

    this.map.on('zoom', (e) => {
      if (this.map.getZoom() > 7) {
        this._removeRadarLayer('280', this.state.slider)
        this._addRadarLayer('140', this.state.slider)
        this.setState({
          'res': '140',
          'slider': this.state.slider
        })
      }
      else {
        this._removeRadarLayer('140', this.state.slider)
        this._addRadarLayer('280', this.state.slider)
        this.setState({
          'res': '280',
          'slider': this.state.slider
        })
      }
    })

    this.map.on('style.load', () => {
      var i = 0;
      for (let v of window.imgs['140']) {
        this._addRadarSource('140', i++, v)
      }

      i = 0;
      for (let v of window.imgs['280']) {
        this._addRadarSource('280', i++, v)
      }
      this._addRadarLayer('280', '0')
    })
  }

  componentWillReceiveProps (props) {
    this._removeRadarLayer(this.state.res, this.state.slider)
    this._addRadarLayer(this.state.res, props.slider)

    this.setState({
      'res': this.state.res,
      'slider': props.slider
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
  onChangeHandler = (e) => {
    this.setState({
      'slider': 7-e
    })
  }

  constructor (props) {
    super(props);
    this.state = {
      'slider': 0
    }
  }

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
        slider={this.state.slider}
        token='pk.eyJ1IjoieXV2YWRtIiwiYSI6ImNpaWRuaWFxazAwMTJ2b2tyZGRmaWpsNWYifQ.qf_V3CFP_NZtLjk5luNM4g' />
      <Slider step={1} min={1} max={7} defaultValue={7} tipFormatter={null} onChange={this.onChangeHandler} />
    </div>
  }
}

ReactDOM.render(<Map/>, document.getElementById('root'))
