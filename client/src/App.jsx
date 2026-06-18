import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import {
  getCurrentUser,
  logOut,
} from "./API.js";
import NavigationBar from "./components/NavigationBar.jsx";
import InstructionsPage from "./pages/InstructionsPage.jsx";
import ExecutionPage from "./pages/ExecutionPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PlanningPage from "./pages/PlanningPage.jsx";
import RankingPage from "./pages/RankingPage.jsx";
import ResultPage from "./pages/ResultPage.jsx";
import SetupPage from "./pages/SetupPage.jsx";
import "./App.css";

function AppContent() {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentGame, setCurrentGame] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkLogin() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setLoggedIn(true);
      } catch {
        setUser(null);
        setLoggedIn(false);
      } finally {
        setLoading(false);
      }
    }

    checkLogin();
  }, []);

  function handleLogin(userData) {
    setUser(userData);
    setLoggedIn(true);
  }

  async function handleLogout() {
    await logOut();
    setUser(null);
    setLoggedIn(false);
    setCurrentGame(null);
    setExecutionResult(null);
    navigate("/");
  }

  function handleGameStarted(game) {
    setCurrentGame(game);
    setExecutionResult(null);
  }

  function handleRouteSubmitted(result) {
    setExecutionResult(result);
  }

  function handleNewGame() {
    setCurrentGame(null);
    setExecutionResult(null);
  }

  if (loading) {
    return (
      <>
        <NavigationBar
          user={user}
          loggedIn={loggedIn}
          onLogout={handleLogout}
        />
        <main className="page">
          <p>Loading...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <NavigationBar
        user={user}
        loggedIn={loggedIn}
        onLogout={handleLogout}
      />
      <main className="page">
        <Routes>
          <Route
            path="/"
            element={<InstructionsPage loggedIn={loggedIn} />}
          />
          <Route
            path="/login"
            element={
              loggedIn
                ? <Navigate to="/ranking" replace />
                : <LoginPage onLogin={handleLogin} />
            }
          />
          <Route
            path="/ranking"
            element={
              loggedIn ? <RankingPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/setup"
            element={
              loggedIn
                ? <SetupPage onGameStarted={handleGameStarted} />
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/play"
            element={
              loggedIn
                ? (
                    <PlanningPage
                      currentGame={currentGame}
                      onRouteSubmitted={handleRouteSubmitted}
                    />
                  )
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/execution"
            element={
              loggedIn
                ? <ExecutionPage executionResult={executionResult} />
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/result"
            element={
              loggedIn
                ? (
                    <ResultPage
                      executionResult={executionResult}
                      onNewGame={handleNewGame}
                    />
                  )
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
