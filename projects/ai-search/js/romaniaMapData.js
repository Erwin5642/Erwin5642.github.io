/**
 * Simplified road map of Romania as used in introductory AI courses
 * (Russell & Norvig, *Artificial Intelligence: A Modern Approach* — same graph as
 * the “Romania” example for search; distances are road segment lengths in km).
 *
 * Node spellings match this app’s labels (e.g. Drobeta → Dobreta, Craiova → Cralova).
 */

export const ROMANIA_NODES = [
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

/**
 * Classical **road** links only (23 undirected segments → both directions in Graph).
 * Use these for layout / path cost g(n). Do **not** mix in straight-line heuristic tables here.
 */
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

/**
 * Straight-line distances to Bucharest (km). Used as heuristic h(n) in informed search.
 * Bucharest entry is 0.
 */
export const STRAIGHT_LINE_TO_BUCHAREST_KM = Object.freeze({
    Arad: 366,
    Bucharest: 0,
    Cralova: 160,
    Dobreta: 242,
    Eforle: 161,
    Fagaras: 178,
    Giurgiu: 77,
    Hirsova: 151,
    Iasi: 226,
    Lugoj: 244,
    Mehadia: 241,
    Neamt: 234,
    Oradea: 380,
    Pitesti: 98,
    'RImnicu Vilcea': 193,
    Sibiu: 253,
    Timisoara: 329,
    Urziceni: 80,
    Vaslui: 199,
    Zerind: 374,
});

/**
 * Bucharest at `center`; other cities on rays at radius straight-line km × kmPerPx (fan layout).
 *
 * @param {import("./Graph.js").Graph} graph
 * @param {{
 *   centerX?: number,
 *   centerY?: number,
 *   kmPerPx?: number,
 * }} [layout]
 */
export function seedRomaniaNodes(graph, layout = {}) {
    const cx = layout.centerX ?? 920;
    const cy = layout.centerY ?? 550;
    const kmPerPx = layout.kmPerPx ?? 1.15;

    graph.addNode('Bucharest', cx, cy);

    const satellites = ROMANIA_NODES.filter((n) => n !== 'Bucharest');
    const m = satellites.length;
    let i = 0;
    for (const name of satellites) {
        const hKmRaw = STRAIGHT_LINE_TO_BUCHAREST_KM[name];
        const hk =
            typeof hKmRaw === 'number' && Number.isFinite(hKmRaw)
                ? hKmRaw
                : 220;
        const ang = (i / m) * Math.PI * 2 - Math.PI / 2;
        const r = hk * kmPerPx;
        graph.addNode(name, cx + r * Math.cos(ang), cy + r * Math.sin(ang));
        i++;
    }
}

/**
 * Adds both directions for each **road** so step costs match the classical undirected map.
 *
 * @param {import("./Graph.js").Graph} graph
 */
export function seedRomaniaRoads(graph) {
    for (const [a, b, km] of ROMANIA_ROADS_KM) {
        graph.addEdge(a, b, { targetLength: km });
        graph.addEdge(b, a, { targetLength: km });
    }
}
