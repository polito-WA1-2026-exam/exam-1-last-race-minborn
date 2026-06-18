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
import LoginPage from "./pages/LoginPage.jsx";
import RankingPage from "./pages/RankingPage.jsx";
import "./App.css";

function AppContent() {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
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
    navigate("/");
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
