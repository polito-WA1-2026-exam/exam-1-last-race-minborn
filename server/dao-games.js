import { dbAll, dbRun } from "./db.js";

const INITIAL_COINS = 20;
const PLANNING_SECONDS = 90;

function buildGraph(stations, segments) {
  const graph = {};

  for (const station of stations) {
    graph[station.id] = [];
  }

  for (const segment of segments) {
    graph[segment.station1_id].push(segment.station2_id);
    graph[segment.station2_id].push(segment.station1_id);
  }

  return graph;
}

function shortestDistance(graph, startId, destinationId) {
  const queue = [{ stationId: startId, distance: 0 }];
  const visited = new Set([startId]);

  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];

    if (current.stationId === destinationId) {
      return current.distance;
    }

    for (const nextStationId of graph[current.stationId]) {
      if (!visited.has(nextStationId)) {
        visited.add(nextStationId);
        queue.push({
          stationId: nextStationId,
          distance: current.distance + 1,
        });
      }
    }
  }

  return null;
}

function randomStation(stations) {
  const index = Math.floor(Math.random() * stations.length);
  return stations[index];
}

export async function createNewGame(userId) {
  const stations = await dbAll(`
    SELECT id, name
    FROM stations
    ORDER BY id
  `);

  const segments = await dbAll(`
    SELECT station1_id, station2_id
    FROM segments
  `);

  const graph = buildGraph(stations, segments);
  let startStation = null;
  let destinationStation = null;
  let distance = null;

  while (distance === null || distance < 3) {
    startStation = randomStation(stations);
    destinationStation = randomStation(stations);
    distance = shortestDistance(graph, startStation.id, destinationStation.id);
  }

  const result = await dbRun(
    `
      INSERT INTO games (
        user_id,
        start_station_id,
        destination_station_id,
        initial_coins,
        final_score,
        valid_route,
        created_at
      ) VALUES (?, ?, ?, ?, NULL, NULL, ?)
    `,
    [
      userId,
      startStation.id,
      destinationStation.id,
      INITIAL_COINS,
      new Date().toISOString(),
    ],
  );

  return {
    gameId: result.id,
    startStation: {
      id: startStation.id,
      name: startStation.name,
    },
    destinationStation: {
      id: destinationStation.id,
      name: destinationStation.name,
    },
    initialCoins: INITIAL_COINS,
    planningSeconds: PLANNING_SECONDS,
  };
}
