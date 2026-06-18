function SegmentList({ segments, selectedSegmentIds, onSelectSegment }) {
  return (
    <section>
      <h2>Available Segments</h2>
      <div className="segment-list">
        {segments.map((segment) => {
          const alreadySelected = selectedSegmentIds.includes(segment.id);

          return (
            <button
              type="button"
              key={segment.id}
              onClick={() => onSelectSegment(segment)}
              disabled={alreadySelected}
            >
              {segment.station1_name} - {segment.station2_name}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default SegmentList;
