function NetworkMap({ network, segments = [], mode }) {
  if (mode === "planning") {
    const stationsById = {};

    for (const segment of segments) {
      stationsById[segment.station1_id] = segment.station1_name;
      stationsById[segment.station2_id] = segment.station2_name;
    }

    const stationNames = Object.values(stationsById).sort();

    return (
      <section className="network-box">
        <h2>Stations</h2>
        <div className="station-grid">
          {stationNames.map((name) => (
            <span className="station-pill" key={name}>
              {name}
            </span>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="network-box">
      <h2>Network</h2>

      <h3>Lines</h3>
      <ul className="simple-list">
        {network.lines.map((line) => (
          <li key={line.id}>
            <span
              className="line-color"
              style={{ backgroundColor: line.color }}
            />
            {line.name} ({line.color})
          </li>
        ))}
      </ul>

      <h3>Stations</h3>
      <div className="station-grid">
        {network.stations.map((station) => (
          <span className="station-pill" key={station.id}>
            {station.name} ({station.x}, {station.y})
          </span>
        ))}
      </div>

      <h3>Connections</h3>
      <ul className="simple-list">
        {network.segments.map((segment) => (
          <li key={segment.id}>
            {segment.station1_name} - {segment.station2_name}
            <div className="line-badges">
              {segment.lines.map((line) => (
                <span
                  className="line-badge"
                  key={line.id}
                  style={{ borderColor: line.color }}
                >
                  {line.name}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default NetworkMap;
