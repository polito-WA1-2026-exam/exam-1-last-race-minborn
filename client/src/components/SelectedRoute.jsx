function SelectedRoute({ selectedSegments }) {
  return (
    <section>
      <h2>Selected Route</h2>

      {selectedSegments.length === 0 && <p>No segments selected yet.</p>}

      {selectedSegments.length > 0 && (
        <ol>
          {selectedSegments.map((segment) => (
            <li key={segment.id}>
              {segment.station1_name} - {segment.station2_name}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default SelectedRoute;
