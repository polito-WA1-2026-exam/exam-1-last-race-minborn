import { dbAll, dbGet, dbRun } from "./db.js";

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

async function saveInvalidRoute(game, reason) {
  await dbRun(
    `
      UPDATE games
      SET final_score = 0, valid_route = 0
      WHERE id = ?
    `,
    [game.id],
  );

  return {
    valid: false,
    initialCoins: game.initial_coins,
    finalScore: 0,
    reason,
    steps: [],
  };
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

export async function submitRoute(gameId, userId, segmentIds) {
  const game = await dbGet(
    `
      SELECT *
      FROM games
      WHERE id = ? AND user_id = ?
    `,
    [gameId, userId],
  );

  if (!game) {
    return {
      valid: false,
      initialCoins: INITIAL_COINS,
      finalScore: 0,
      reason: "Game not found",
      steps: [],
    };
  }

  if (game.final_score !== null) {
    return {
      valid: game.valid_route === 1,
      initialCoins: game.initial_coins,
      finalScore: game.final_score,
      reason: "Game already completed",
      steps: [],
    };
  }

  if (!Array.isArray(segmentIds)) {
    return saveInvalidRoute(game, "segmentIds must be an array");
  }

  if (segmentIds.length === 0) {
    return saveInvalidRoute(game, "Route cannot be empty");
  }

  const segments = await dbAll(`
    SELECT
      segments.id,
      segments.station1_id,
      segments.station2_id,
      station1.name AS station1_name,
      station2.name AS station2_name
    FROM segments
    JOIN stations AS station1 ON station1.id = segments.station1_id
    JOIN stations AS station2 ON station2.id = segments.station2_id
  `);

  const segmentLines = await dbAll(`
    SELECT segment_id, line_id
    FROM segment_lines
  `);

  const events = await dbAll(`
    SELECT description, effect
    FROM events
  `);

  const segmentsById = {};

  for (const segment of segments) {
    segment.lineIds = [];
    segmentsById[segment.id] = segment;
  }

  for (const row of segmentLines) {
    if (segmentsById[row.segment_id]) {
      segmentsById[row.segment_id].lineIds.push(row.line_id);
    }
  }

  const stationLines = {};

  for (const segment of segments) {
    if (!stationLines[segment.station1_id]) {
      stationLines[segment.station1_id] = new Set();
    }

    if (!stationLines[segment.station2_id]) {
      stationLines[segment.station2_id] = new Set();
    }

    for (const lineId of segment.lineIds) {
      stationLines[segment.station1_id].add(lineId);
      stationLines[segment.station2_id].add(lineId);
    }
  }

  const usedSegmentIds = new Set();
  const plannedSteps = [];
  let currentStationId = game.start_station_id;
  let possibleLineIds = [];

  for (let i = 0; i < segmentIds.length; i++) {
    const segmentId = Number(segmentIds[i]);

    if (!Number.isInteger(segmentId)) {
      return saveInvalidRoute(game, "Segment id is invalid");
    }

    if (usedSegmentIds.has(segmentId)) {
      return saveInvalidRoute(game, "The same segment cannot be used twice");
    }

    const segment = segmentsById[segmentId];

    if (!segment) {
      return saveInvalidRoute(game, "Segment does not exist");
    }

    usedSegmentIds.add(segmentId);

    let nextStationId = null;
    let fromStationName = null;
    let toStationName = null;

    if (segment.station1_id === currentStationId) {
      nextStationId = segment.station2_id;
      fromStationName = segment.station1_name;
      toStationName = segment.station2_name;
    } else if (segment.station2_id === currentStationId) {
      nextStationId = segment.station1_id;
      fromStationName = segment.station2_name;
      toStationName = segment.station1_name;
    } else if (i === 0) {
      return saveInvalidRoute(game, "Route must start from the start station");
    } else {
      return saveInvalidRoute(game, "Consecutive segments must be connected");
    }

    if (possibleLineIds.length === 0) {
      possibleLineIds = [...segment.lineIds];
    } else {
      const sharedLineIds = [];

      for (const lineId of possibleLineIds) {
        if (segment.lineIds.includes(lineId)) {
          sharedLineIds.push(lineId);
        }
      }

      if (sharedLineIds.length > 0) {
        possibleLineIds = sharedLineIds;
      } else if (stationLines[currentStationId].size > 1) {
        possibleLineIds = [...segment.lineIds];
      } else {
        return saveInvalidRoute(
          game,
          "Line changes are allowed only at interchange stations",
        );
      }
    }

    plannedSteps.push({
      segmentId,
      from: fromStationName,
      to: toStationName,
    });

    currentStationId = nextStationId;
  }

  if (currentStationId !== game.destination_station_id) {
    return saveInvalidRoute(game, "Route does not reach the destination");
  }

  let coins = game.initial_coins;
  const steps = [];

  for (const step of plannedSteps) {
    const eventIndex = Math.floor(Math.random() * events.length);
    const event = events[eventIndex];
    coins += event.effect;

    steps.push({
      segmentId: step.segmentId,
      from: step.from,
      to: step.to,
      eventDescription: event.description,
      effect: event.effect,
      coinsAfter: coins,
    });
  }

  const finalScore = Math.max(coins, 0);

  await dbRun(
    `
      UPDATE games
      SET final_score = ?, valid_route = 1
      WHERE id = ?
    `,
    [finalScore, game.id],
  );

  return {
    valid: true,
    initialCoins: game.initial_coins,
    finalScore,
    steps,
  };
}

export function getRanking() {
  return dbAll(`
    SELECT
      users.username,
      MAX(games.final_score) AS bestScore
    FROM games
    JOIN users ON users.id = games.user_id
    WHERE games.valid_route = 1
      AND games.final_score IS NOT NULL
    GROUP BY users.id, users.username
    ORDER BY bestScore DESC
  `);
}
