(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("geshem.js", function(exports, require, module) {
Vue.component('root', {
  template: '<div>A custom component!</div>'
})

var app = new Vue({
  el: '#app',
  data: {
    imgs: window.imgs,
    res: 280,
    slider: 0,
    rasterCoords: {
      140: [
        [33.35317413, 33.27232471],
        [36.32243686, 33.27232471],
        [36.32243686, 30.72293428],
        [33.35317413, 30.72293428]
      ],
      280: [
        [31.93095218, 34.5156862],
        [37.86644267, 34.5156862],
        [37.86644267, 29.42911589],
        [31.93095218, 29.42911589]
      ]
    }
  }
});

mapboxgl.accessToken = 'pk.eyJ1IjoieXV2YWRtIiwiYSI6ImNpcnMxbzBuaTAwZWdoa25oczlzZmkwbHcifQ.UHtLngbKm9O8945pJm23Nw';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v9',
  container: 'map',
  maxZoom: 10,
  minZoom: 5,
  zoom: 6.3,
  center: [35, 31.9],
  hash: false
});

function addRadarSource(res, i, url) {
  map.addSource('radar-' + res + '-' + i, {
    type: 'image',
    url: '/static/img/' + url,
    coordinates: app.rasterCoords[res]
  })
}

function addRadarLayer(res, i) {
  map.addLayer({
    id: 'radar-' + res + '-' + i,
    source: 'radar-' + res + '-' + i,
    type: 'raster',
    paint: {
      'raster-opacity': 0.85
    }
  })
}

function removeRadarLayer(res, i) {
  map.removeLayer('radar-' + res + '-' + i)
}

map.on('style.load', function () {
  var i = 0;
  while (i < app.imgs['140'].length) {
    addRadarSource('140', i, app.imgs['140'][i++])
  }
  var i = 0;
  while (i < app.imgs['280'].length) {
    addRadarSource('280', i, app.imgs['280'][i++])
  }
  addRadarLayer('280', 0)
})




});

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map