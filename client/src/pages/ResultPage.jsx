import { Link, Navigate } from "react-router-dom";

function ResultPage({ executionResult, onNewGame }) {
  if (!executionResult) {
    return <Navigate to="/setup" replace />;
  }

  return (
    <section>
      <h1>Result</h1>
      <p>Route: {executionResult.valid ? "valid" : "invalid"}</p>
      <p>Final score: {executionResult.finalScore}</p>

      {!executionResult.valid && (
        <p className="error">Reason: {executionResult.reason}</p>
      )}

      <div className="button-row">
        <Link to="/setup" onClick={onNewGame}>
          New Game
        </Link>
        <Link to="/ranking">Ranking</Link>
      </div>
    </section>
  );
}

export default ResultPage;
