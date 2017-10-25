const GeocodingAPI = require('mapbox/lib/services/geocoding');

const client = new GeocodingAPI(process.env.DETHER_BOT_MAPBOX_TOKEN);

const geoDistance = (latitudeFrom, longitudeFrom, latitudeTo, longitudeTo) => {
  const earthRadius = 6371000;
  const latFrom = latitudeFrom * (Math.PI / 180);
  const lonFrom = longitudeFrom * (Math.PI / 180);
  const latTo = latitudeTo * (Math.PI / 180);
  const lonTo = longitudeTo * (Math.PI / 180);
  const latDelta = latTo - latFrom;
  const lonDelta = lonTo - lonFrom;

  const angle = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(latDelta / 2), 2)
    + Math.cos(latFrom)
    * Math.cos(latTo)
    * Math.pow(Math.sin(lonDelta / 2), 2)));
  return angle * earthRadius;
};

const sortGpsCoord = (poi, gpsTab) =>
  gpsTab.sort(function(a, b) {
    const distA = geoDistance(poi.lat, poi.lng, a.lat, a.lng);
    const distB = geoDistance(poi.lat, poi.lng, b.lat, b.lng);
    return distA - distB;
  });



const getcountrycode = latlng =>
  new Promise((res, rej) => {
    client.geocodeReverse({
        latitude: latlng.lat,
        longitude: latlng.lng,
      },
      {
        limit: 1,
        types: 'country',
      },
      (err, data) => {
        if (err) rej(err);
        else {
          const results = data.features;
          if (results && results.length > 0) {
            res((results[0].id).replace(/\D/g, ''));
          }
          else rej(new Error('no results'));
        }
      }
    );
  });

const geocode = address =>
  new Promise((res, rej) => {
    client.geocodeForward(address, { limit: 1 }, (err, data) => {
      if (err) rej(err);
      else {
        const results = data.features;
        if (results && results.length > 0) res(results[0]);
        else rej(new Error('no results'));
      }
    });
  });

const reverseGeocode = latlng =>
  new Promise((res, rej) => {
    client.geocodeReverse({
      latitude: latlng.lat,
      longitude: latlng.lng,
    }, (err, data) => {
      if (err) rej(err);
      else {
        const results = data.features;
        if (results && results.length > 0) res(results[0].place_name);
        else rej(new Error('no results'));
      }
    });
  });


const mapboxAPI = {
  getcountrycode,
  sortGpsCoord,
  geocode,
  reverseGeocode,
};

module.exports = mapboxAPI;
