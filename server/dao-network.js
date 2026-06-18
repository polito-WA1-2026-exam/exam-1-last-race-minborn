import { dbAll } from "./db.js";

export async function getFullNetwork() {
  const stations = await dbAll(
    "SELECT id, name, x, y FROM stations ORDER BY id",
  );
  const lines = await dbAll(
    "SELECT id, name, color FROM lines ORDER BY id",
  );
  const segments = await dbAll(
    `
      SELECT
        segments.id,
        segments.station1_id,
        segments.station2_id,
        station1.name AS station1_name,
        station2.name AS station2_name
      FROM segments
      JOIN stations AS station1 ON station1.id = segments.station1_id
      JOIN stations AS station2 ON station2.id = segments.station2_id
      ORDER BY segments.id
    `,
  );
  const segmentLines = await dbAll(
    `
      SELECT
        segment_lines.segment_id,
        lines.id,
        lines.name,
        lines.color
      FROM segment_lines
      JOIN lines ON lines.id = segment_lines.line_id
      ORDER BY segment_lines.segment_id, lines.id
    `,
  );

  const linesBySegmentId = new Map();

  for (const line of segmentLines) {
    const currentLines = linesBySegmentId.get(line.segment_id) || [];
    currentLines.push({
      id: line.id,
      name: line.name,
      color: line.color,
    });
    linesBySegmentId.set(line.segment_id, currentLines);
  }

  return {
    stations,
    lines,
    segments: segments.map((segment) => ({
      ...segment,
      lines: linesBySegmentId.get(segment.id) || [],
    })),
  };
}

export function getSegments() {
  return dbAll(
    `
      SELECT
        segments.id,
        segments.station1_id,
        segments.station2_id,
        station1.name AS station1_name,
        station2.name AS station2_name
      FROM segments
      JOIN stations AS station1 ON station1.id = segments.station1_id
      JOIN stations AS station2 ON station2.id = segments.station2_id
      ORDER BY segments.id
    `,
  );
}
