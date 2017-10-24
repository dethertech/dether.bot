const GeocodingAPI = require('mapbox/lib/services/geocoding');
// const mapboxgl = require('mapbox-gl/dist/mapbox-gl');
// you need to add a mapbox token in .env to use geocoding API
// require('dotenv').config({ path: '.env' });

// const token = process.env.TEST_MAPBOX_TOKEN;

const client = new GeocodingAPI('pk.eyJ1IjoibWVoZGlkdHIiLCJhIjoiY2o4ZW9zdWxpMHI4azJxbnZvcW0xNGtieSJ9.c-SJnFhWfYMEx4K4BB951A');


const geoDistance = (latitudeFrom, longitudeFrom, latitudeTo, longitudeTo) => {
  // convert from degrees to radians
  const earthRadius = 6371000;
  const latFrom = latitudeFrom * (Math.PI / 180);
  const lonFrom = longitudeFrom * (Math.PI / 180);
  const latTo = latitudeTo * (Math.PI / 180);
  const lonTo = longitudeTo * (Math.PI / 180);
  const latDelta = latTo - latFrom;
  const lonDelta = lonTo - lonFrom;

  const angle = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(latDelta / 2), 2) + Math.cos(latFrom) * Math.cos(latTo) * Math.pow(Math.sin(lonDelta / 2), 2)));
  return angle * earthRadius;
};

const sortCoord = (poi, gpsTab) =>
  gpsTab.sort(function(a, b) {
    const distA = geoDistance(poi.lat, poi.lng, a.lat, a.lng);
    const distB = geoDistance(poi.lat, poi.lng, b.lat, b.lng);
    return distA - distB;
  });



const getCountryId = latlng =>
  new Promise((res, rej) => {
    const location = {
      latitude: latlng.lat,
      longitude: latlng.lng,
    };
    const options = {
      limit: 1,
      types: 'country',
    };

    client.geocodeReverse(location, options, (err, data) => {
      if (err) {
        rej(err);
      } else {
        const results = data.features;
        if (results && results.length > 0) {
          res((results[0].id).replace(/\D/g, ''));
        } else {
          rej(new Error('no results'));
        }
      }
    });
  });

const geocode = address =>
  new Promise((res, rej) => {
    const options = {
      limit: 1,
    };
    client.geocodeForward(address, options, (err, data) => {
      if (err) {
        rej(err);
      } else {
        const results = data.features;
        if (results && results.length > 0) {
          res(results[0]);
        } else {
          rej(new Error('no results'));
        }
      }
    });
  });

const reverseGeocode = latlng =>
  new Promise((res, rej) => {
    // const latlng = mapboxgl.LngLat.convert(latLngLike);
    const location = {
      latitude: latlng.lat,
      longitude: latlng.lng,
    };
    client.geocodeReverse(location, (err, data) => {
      if (err) {
        rej(err);
      } else {
        const results = data.features;
        if (results && results.length > 0) {
          res(results[0].place_name);
        } else {
          rej(new Error('no results'));
        }
      }
    });
  });


const mapboxAPI = {
  getcountrycode: getCountryId,
  sortGpsCoord: sortCoord,
  geocode,
  reverseGeocode,
};

module.exports = mapboxAPI;
