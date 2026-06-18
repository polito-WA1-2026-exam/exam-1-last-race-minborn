import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNetwork, startGame } from "../API.js";
import NetworkMap from "../components/NetworkMap.jsx";

function SetupPage({ onGameStarted }) {
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadNetwork() {
      try {
        const data = await getNetwork();
        setNetwork(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadNetwork();
  }, []);

  async function handleStartGame() {
    setStarting(true);
    setError("");

    try {
      const game = await startGame();
      onGameStarted(game);
      navigate("/play");
    } catch (err) {
      setError(err.message);
      setStarting(false);
    }
  }

  return (
    <section>
      <h1>Setup</h1>
      <p>Study the underground network before starting a new race.</p>

      {loading && <p>Loading network...</p>}
      {error && <p className="error">{error}</p>}
      {network && <NetworkMap network={network} mode="setup" />}

      <button type="button" onClick={handleStartGame} disabled={starting}>
        {starting ? "Starting..." : "Start Game"}
      </button>
    </section>
  );
}

export default SetupPage;
