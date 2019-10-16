const DEVELOPMENT = process.env.NODE_ENV === "development";

const IMAGES_BASE_URL = DEVELOPMENT ? '' : 'https://imgs.geshem.space';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoieXV2YWRtIiwiYSI6ImNpcnMxbzBuaTAwZWdoa25oczlzZmkwbHcifQ.UHtLngbKm9O8945pJm23Nw';

module.exports = { IMAGES_BASE_URL, MAPBOX_ACCESS_TOKEN };
