import { Link } from "react-router-dom";

function InstructionsPage({ loggedIn }) {
  return (
    <section>
      <h1>Last Race</h1>
      <p>
        Plan a metro route from your start station to your destination before
        the timer ends.
      </p>
      <p>
        When you submit the route, each segment triggers a random event that can
        add or remove coins. Your final score is the number of coins left.
      </p>
      <p>
        The route must use connected segments and line changes are allowed only
        at interchange stations.
      </p>

      {!loggedIn && (
        <p>
          <Link to="/login">Log in</Link> to see protected pages and play later.
        </p>
      )}

      {loggedIn && (
        <p>You are logged in. The game page will be added soon.</p>
      )}
    </section>
  );
}

export default InstructionsPage;
