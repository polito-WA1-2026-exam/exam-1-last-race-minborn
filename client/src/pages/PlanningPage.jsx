import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getSegments, submitRoute } from "../API.js";
import NetworkMap from "../components/NetworkMap.jsx";
import SegmentList from "../components/SegmentList.jsx";
import SelectedRoute from "../components/SelectedRoute.jsx";
import Timer from "../components/Timer.jsx";

function PlanningPage({ currentGame, onRouteSubmitted }) {
  const [segments, setSegments] = useState([]);
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(
    currentGame ? currentGame.planningSeconds : 90,
  );
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadSegments() {
      try {
        const data = await getSegments();
        setSegments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadSegments();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds <= 0) {
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!currentGame || secondsLeft > 0 || submitted) {
      return;
    }

    async function submitWhenTimeEnds() {
      setSubmitted(true);

      try {
        const segmentIds = selectedSegments.map((segment) => segment.id);
        const result = await submitRoute(currentGame.gameId, segmentIds);
        onRouteSubmitted(result);
        navigate("/execution");
      } catch (err) {
        setError(err.message);
      }
    }

    submitWhenTimeEnds();
  }, [
    currentGame,
    navigate,
    onRouteSubmitted,
    secondsLeft,
    selectedSegments,
    submitted,
  ]);

  if (!currentGame) {
    return <Navigate to="/setup" replace />;
  }

  function addSegment(segment) {
    setSelectedSegments((currentSegments) => [...currentSegments, segment]);
  }

  function undoLastSegment() {
    setSelectedSegments((currentSegments) => currentSegments.slice(0, -1));
  }

  function clearRoute() {
    setSelectedSegments([]);
  }

  async function handleSubmit() {
    if (submitted) {
      return;
    }

    setSubmitted(true);
    setError("");

    try {
      const segmentIds = selectedSegments.map((segment) => segment.id);
      const result = await submitRoute(currentGame.gameId, segmentIds);
      onRouteSubmitted(result);
      navigate("/execution");
    } catch (err) {
      setError(err.message);
      setSubmitted(false);
    }
  }

  const selectedSegmentIds = selectedSegments.map((segment) => segment.id);

  return (
    <section>
      <h1>Plan Your Route</h1>
      <p>
        Start: <strong>{currentGame.startStation.name}</strong>
      </p>
      <p>
        Destination: <strong>{currentGame.destinationStation.name}</strong>
      </p>

      <Timer secondsLeft={secondsLeft} />

      {loading && <p>Loading segments...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && (
        <>
          <NetworkMap segments={segments} mode="planning" />
          <SegmentList
            segments={segments}
            selectedSegmentIds={selectedSegmentIds}
            onSelectSegment={addSegment}
          />
          <SelectedRoute selectedSegments={selectedSegments} />

          <div className="button-row">
            <button
              type="button"
              onClick={undoLastSegment}
              disabled={selectedSegments.length === 0 || submitted}
            >
              Undo
            </button>
            <button
              type="button"
              onClick={clearRoute}
              disabled={selectedSegments.length === 0 || submitted}
            >
              Clear
            </button>
            <button type="button" onClick={handleSubmit} disabled={submitted}>
              Submit Route
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default PlanningPage;
