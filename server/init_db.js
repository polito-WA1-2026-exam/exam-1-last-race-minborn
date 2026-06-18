import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import db, { dbGet, dbRun } from "./db.js";

const scryptAsync = promisify(scrypt);

const stations = [
  { name: "Northgate", x: 50, y: 10 },
  { name: "Museum Row", x: 50, y: 24 },
  { name: "Central Plaza", x: 50, y: 40 },
  { name: "River Market", x: 50, y: 58 },
  { name: "South Pier", x: 50, y: 76 },
  { name: "Harbor Point", x: 12, y: 40 },
  { name: "West End", x: 30, y: 40 },
  { name: "Eastbank", x: 68, y: 40 },
  { name: "Garden Hills", x: 84, y: 40 },
  { name: "Old Quarry", x: 98, y: 40 },
  { name: "University", x: 16, y: 66 },
  { name: "Theater District", x: 30, y: 58 },
  { name: "Tech Park", x: 68, y: 70 },
  { name: "Observatory", x: 92, y: 82 },
  { name: "Civic Hall", x: 80, y: 76 },
];

const lines = [
  { name: "Crimson Line", color: "#d94b4b" },
  { name: "Azure Line", color: "#2f80ed" },
  { name: "Emerald Line", color: "#2f9e44" },
  { name: "Gold Line", color: "#f2b705" },
];

const lineSegments = {
  "Crimson Line": [
    ["Northgate", "Museum Row"],
    ["Museum Row", "Central Plaza"],
    ["Central Plaza", "River Market"],
    ["River Market", "South Pier"],
  ],
  "Azure Line": [
    ["Harbor Point", "West End"],
    ["West End", "Central Plaza"],
    ["Central Plaza", "Eastbank"],
    ["Eastbank", "Garden Hills"],
    ["Garden Hills", "Old Quarry"],
  ],
  "Emerald Line": [
    ["University", "Theater District"],
    ["Theater District", "West End"],
    ["West End", "River Market"],
    ["River Market", "Tech Park"],
  ],
  "Gold Line": [
    ["Observatory", "Civic Hall"],
    ["Civic Hall", "Tech Park"],
  ],
};

const events = [
  { description: "Street festival crowds slow the transfer.", effect: -2 },
  { description: "Express tunnel opens for one segment.", effect: 3 },
  { description: "Signal checks near the platform.", effect: -1 },
  { description: "Lost-and-found reward from a grateful rider.", effect: 2 },
  { description: "Track maintenance forces a cautious crawl.", effect: -3 },
  { description: "Perfect connection with no waiting time.", effect: 4 },
  { description: "Ticket machine eats a coin.", effect: -1 },
  { description: "Helpful station guide suggests a shortcut.", effect: 1 },
  { description: "Emergency reroute adds extra travel time.", effect: -4 },
  { description: "Quiet carriage keeps the journey smooth.", effect: 2 },
];

const users = [
  { username: "user1", password: "password" },
  { username: "user2", password: "password" },
  { username: "user3", password: "password" },
];

const games = [
  {
    username: "user1",
    start: "Northgate",
    destination: "Old Quarry",
    initialCoins: 20,
    finalScore: 15,
    validRoute: 1,
    createdAt: "2026-06-18T08:30:00.000Z",
  },
  {
    username: "user1",
    start: "University",
    destination: "South Pier",
    initialCoins: 20,
    finalScore: 12,
    validRoute: 1,
    createdAt: "2026-06-18T08:45:00.000Z",
  },
  {
    username: "user2",
    start: "Harbor Point",
    destination: "Tech Park",
    initialCoins: 20,
    finalScore: 14,
    validRoute: 1,
    createdAt: "2026-06-18T09:00:00.000Z",
  },
  {
    username: "user2",
    start: "Observatory",
    destination: "Central Plaza",
    initialCoins: 20,
    finalScore: 11,
    validRoute: 1,
    createdAt: "2026-06-18T09:15:00.000Z",
  },
];

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hashBuffer = await scryptAsync(password, salt, 64);

  return {
    salt,
    hash: hashBuffer.toString("hex"),
  };
}

async function dropTables() {
  await dbRun("DROP TABLE IF EXISTS segment_lines");
  await dbRun("DROP TABLE IF EXISTS games");
  await dbRun("DROP TABLE IF EXISTS events");
  await dbRun("DROP TABLE IF EXISTS segments");
  await dbRun("DROP TABLE IF EXISTS lines");
  await dbRun("DROP TABLE IF EXISTS stations");
  await dbRun("DROP TABLE IF EXISTS users");
}

async function createTables() {
  await dbRun(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      salt TEXT NOT NULL,
      hash TEXT NOT NULL
    )
  `);

  await dbRun(`
    CREATE TABLE stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      x INTEGER NOT NULL,
      y INTEGER NOT NULL
    )
  `);

  await dbRun(`
    CREATE TABLE lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT NOT NULL
    )
  `);

  await dbRun(`
    CREATE TABLE segments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station1_id INTEGER NOT NULL,
      station2_id INTEGER NOT NULL,
      UNIQUE(station1_id, station2_id),
      FOREIGN KEY(station1_id) REFERENCES stations(id),
      FOREIGN KEY(station2_id) REFERENCES stations(id)
    )
  `);

  await dbRun(`
    CREATE TABLE segment_lines (
      segment_id INTEGER NOT NULL,
      line_id INTEGER NOT NULL,
      PRIMARY KEY(segment_id, line_id),
      FOREIGN KEY(segment_id) REFERENCES segments(id),
      FOREIGN KEY(line_id) REFERENCES lines(id)
    )
  `);

  await dbRun(`
    CREATE TABLE events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      effect INTEGER NOT NULL CHECK(effect >= -4 AND effect <= 4)
    )
  `);

  await dbRun(`
    CREATE TABLE games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      start_station_id INTEGER NOT NULL,
      destination_station_id INTEGER NOT NULL,
      initial_coins INTEGER NOT NULL DEFAULT 20,
      final_score INTEGER,
      valid_route INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(start_station_id) REFERENCES stations(id),
      FOREIGN KEY(destination_station_id) REFERENCES stations(id)
    )
  `);
}

async function insertStations() {
  const stationIds = new Map();

  for (const station of stations) {
    const result = await dbRun(
      "INSERT INTO stations (name, x, y) VALUES (?, ?, ?)",
      [station.name, station.x, station.y],
    );
    stationIds.set(station.name, result.id);
  }

  return stationIds;
}

async function insertLines() {
  const lineIds = new Map();

  for (const line of lines) {
    const result = await dbRun(
      "INSERT INTO lines (name, color) VALUES (?, ?)",
      [line.name, line.color],
    );
    lineIds.set(line.name, result.id);
  }

  return lineIds;
}

async function insertSegment(stationIds, lineIds, stationA, stationB, lineName) {
  const firstId = stationIds.get(stationA);
  const secondId = stationIds.get(stationB);
  const station1Id = Math.min(firstId, secondId);
  const station2Id = Math.max(firstId, secondId);

  await dbRun(
    "INSERT OR IGNORE INTO segments (station1_id, station2_id) VALUES (?, ?)",
    [station1Id, station2Id],
  );

  const segment = await dbGet(
    "SELECT id FROM segments WHERE station1_id = ? AND station2_id = ?",
    [station1Id, station2Id],
  );

  await dbRun(
    "INSERT OR IGNORE INTO segment_lines (segment_id, line_id) VALUES (?, ?)",
    [segment.id, lineIds.get(lineName)],
  );
}

async function insertSegments(stationIds, lineIds) {
  for (const [lineName, segmentsForLine] of Object.entries(lineSegments)) {
    for (const [stationA, stationB] of segmentsForLine) {
      await insertSegment(stationIds, lineIds, stationA, stationB, lineName);
    }
  }
}

async function insertEvents() {
  for (const event of events) {
    await dbRun(
      "INSERT INTO events (description, effect) VALUES (?, ?)",
      [event.description, event.effect],
    );
  }
}

async function insertUsers() {
  const userIds = new Map();

  for (const user of users) {
    const password = await hashPassword(user.password);
    const result = await dbRun(
      "INSERT INTO users (username, salt, hash) VALUES (?, ?, ?)",
      [user.username, password.salt, password.hash],
    );
    userIds.set(user.username, result.id);
  }

  return userIds;
}

async function insertGames(userIds, stationIds) {
  for (const game of games) {
    await dbRun(
      `
        INSERT INTO games (
          user_id,
          start_station_id,
          destination_station_id,
          initial_coins,
          final_score,
          valid_route,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userIds.get(game.username),
        stationIds.get(game.start),
        stationIds.get(game.destination),
        game.initialCoins,
        game.finalScore,
        game.validRoute,
        game.createdAt,
      ],
    );
  }
}

async function seedData() {
  const stationIds = await insertStations();
  const lineIds = await insertLines();

  await insertSegments(stationIds, lineIds);
  await insertEvents();

  const userIds = await insertUsers();

  await insertGames(userIds, stationIds);
}

function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

async function main() {
  await dbRun("PRAGMA foreign_keys = ON");
  await dbRun("BEGIN TRANSACTION");

  try {
    await dropTables();
    await createTables();
    await seedData();
    await dbRun("COMMIT");
    console.log("Last Race database initialized successfully at server/last_race.sqlite");
  } catch (err) {
    await dbRun("ROLLBACK").catch(() => {});
    throw err;
  }
}

try {
  await main();
} catch (err) {
  console.error("Failed to initialize the Last Race database:", err);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
