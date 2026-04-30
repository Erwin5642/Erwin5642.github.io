const EARTH_RADIUS_KM = 6371;

const ROMANIA_NODES = [
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
];

const ROMANIA_LAT_LON = {
  Arad: {lat: 46.176, lon: 21.319},
  Bucharest: {lat: 44.427, lon: 26.103},
  Cralova: {lat: 44.331, lon: 23.794},
  Dobreta: {lat: 44.632, lon: 22.656},
  Eforle: {lat: 44.066, lon: 28.633},
  Fagaras: {lat: 45.846, lon: 24.974},
  Giurgiu: {lat: 43.903, lon: 25.957},
  Hirsova: {lat: 44.685, lon: 27.957},
  Iasi: {lat: 47.158, lon: 27.591},
  Lugoj: {lat: 45.689, lon: 21.913},
  Mehadia: {lat: 44.974, lon: 22.364},
  Neamt: {lat: 46.927, lon: 26.371},
  Oradea: {lat: 47.072, lon: 21.929},
  Pitesti: {lat: 44.85, lon: 24.867},
  'RImnicu Vilcea': {lat: 45.104, lon: 24.367},
  Sibiu: {lat: 45.798, lon: 24.146},
  Timisoara: {lat: 45.759, lon: 21.229},
  Urziceni: {lat: 44.716, lon: 26.643},
  Vaslui: {lat: 46.631, lon: 27.732},
  Zerind: {lat: 46.617, lon: 21.517},
};

const BUCHAREST_GEO = ROMANIA_LAT_LON.Bucharest;

export function latLonToKmFromBucharest(pos) {
  const refLat = BUCHAREST_GEO.lat;
  const refLon = BUCHAREST_GEO.lon;
  const dLat = ((pos.lat - refLat) * Math.PI) / 180;
  const dLon = ((pos.lon - refLon) * Math.PI) / 180;
  const x = dLon * EARTH_RADIUS_KM * Math.cos((refLat * Math.PI) / 180);
  const y = -dLat * EARTH_RADIUS_KM;
  return {x, y};
}

export const ROMANIA_ROADS_KM = [
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
];

export function seedRomaniaNodes(graph) {
  for (const name of ROMANIA_NODES) {
    const {x, y} = latLonToKmFromBucharest(ROMANIA_LAT_LON[name]);
    graph.addNode(name, x, y);
  }
}

export function seedRomaniaRoads(graph) {
  for (const [a, b, km] of ROMANIA_ROADS_KM) {
    graph.addEdge(a, b, km);
  }
}
