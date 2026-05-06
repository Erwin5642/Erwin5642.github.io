export const DEFAULT_ROMANIA_SOURCE = 'Arad';

export const DEFAULT_ROMANIA_DESTINATION = 'Bucharest';

export const ROMANIA_CITIES = Object.freeze([
  'Arad',
  'Bucharest',
  'Cralova',
  'Dobreta',
  'Eforle',
  'Fagaras',
  'Giurgiu',
  'Hirsova',
  'Iasi',
  'Lugoj',
  'Mehadia',
  'Neamt',
  'Oradea',
  'Pitesti',
  'RImnicu Vilcea',
  'Sibiu',
  'Timisoara',
  'Urziceni',
  'Vaslui',
  'Zerind',
]);

export const ROMANIA_ROADS_KM = Object.freeze([
  ['Oradea', 'Zerind', 71],
  ['Oradea', 'Sibiu', 151],
  ['Zerind', 'Arad', 75],
  ['Arad', 'Timisoara', 118],
  ['Arad', 'Sibiu', 140],
  ['Timisoara', 'Lugoj', 111],
  ['Lugoj', 'Mehadia', 70],
  ['Mehadia', 'Dobreta', 75],
  ['Dobreta', 'Cralova', 120],
  ['Sibiu', 'Fagaras', 99],
  ['Sibiu', 'RImnicu Vilcea', 80],
  ['RImnicu Vilcea', 'Pitesti', 97],
  ['RImnicu Vilcea', 'Cralova', 146],
  ['Cralova', 'Pitesti', 138],
  ['Fagaras', 'Bucharest', 211],
  ['Pitesti', 'Bucharest', 101],
  ['Giurgiu', 'Bucharest', 90],
  ['Bucharest', 'Urziceni', 85],
  ['Neamt', 'Iasi', 87],
  ['Urziceni', 'Vaslui', 142],
  ['Urziceni', 'Hirsova', 98],
  ['Iasi', 'Vaslui', 92],
  ['Hirsova', 'Eforle', 86],
]);

const ROMANIA_LAT_LON = Object.freeze({
  Arad: Object.freeze({lat: 46.176, lon: 21.319}),
  Bucharest: Object.freeze({lat: 44.427, lon: 26.103}),
  Cralova: Object.freeze({lat: 44.331, lon: 23.794}),
  Dobreta: Object.freeze({lat: 44.632, lon: 22.656}),
  Eforle: Object.freeze({lat: 44.066, lon: 28.633}),
  Fagaras: Object.freeze({lat: 45.846, lon: 24.974}),
  Giurgiu: Object.freeze({lat: 43.903, lon: 25.957}),
  Hirsova: Object.freeze({lat: 44.685, lon: 27.957}),
  Iasi: Object.freeze({lat: 47.158, lon: 27.591}),
  Lugoj: Object.freeze({lat: 45.689, lon: 21.913}),
  Mehadia: Object.freeze({lat: 44.974, lon: 22.364}),
  Neamt: Object.freeze({lat: 46.927, lon: 26.371}),
  Oradea: Object.freeze({lat: 47.072, lon: 21.929}),
  Pitesti: Object.freeze({lat: 44.85, lon: 24.867}),
  'RImnicu Vilcea': Object.freeze({lat: 45.104, lon: 24.367}),
  Sibiu: Object.freeze({lat: 45.798, lon: 24.146}),
  Timisoara: Object.freeze({lat: 45.759, lon: 21.229}),
  Urziceni: Object.freeze({lat: 44.716, lon: 26.643}),
  Vaslui: Object.freeze({lat: 46.631, lon: 27.732}),
  Zerind: Object.freeze({lat: 46.617, lon: 21.517}),
});

const EARTH_KM_PER_DEG_LAT = 111.32;

export function latLonToKm(lat, lon,
    origin = ROMANIA_LAT_LON[DEFAULT_ROMANIA_SOURCE]) {
  const meanLatRad = ((lat + origin.lat) / 2) * (Math.PI / 180);
  const kmPerDegLon = EARTH_KM_PER_DEG_LAT * Math.cos(meanLatRad);
  return {
    xKm: (lon - origin.lon) * kmPerDegLon,
    yKm: (lat - origin.lat) * EARTH_KM_PER_DEG_LAT,
  };
}

export const ROMANIA_POSITIONS_KM = Object.freeze(
    Object.fromEntries(
        Object.entries(ROMANIA_LAT_LON).map(([city, {lat, lon}]) => {
          const {xKm, yKm} = latLonToKm(lat, lon);
          return [city, Object.freeze({xKm, yKm})];
        }),
    ),
);
