import { useEffect, useState } from "react";
import { getRanking } from "../API.js";

function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRanking() {
      try {
        const data = await getRanking();
        setRanking(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadRanking();
  }, []);

  if (loading) {
    return <p>Loading ranking...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <section>
      <h1>Ranking</h1>

      {ranking.length === 0 && <p>No completed valid games yet.</p>}

      {ranking.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Best score</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((row) => (
              <tr key={row.username}>
                <td>{row.username}</td>
                <td>{row.bestScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default RankingPage;
