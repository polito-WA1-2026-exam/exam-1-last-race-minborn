import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import passport from "passport";
import passportLocal from "passport-local";
import {
  checkPassword,
  getUserById,
  getUserByUsername,
} from "./dao-users.js";
import { getFullNetwork, getSegments } from "./dao-network.js";
import { createNewGame, submitRoute } from "./dao-games.js";

const LocalStrategy = passportLocal.Strategy;
const app = express();
const port = 3001;

app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(
  session({
    secret: "last-race-development-secret",
    resave: false,
    saveUninitialized: false,
  }),
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await getUserByUsername(username);

      if (!user) {
        return done(null, false);
      }

      const passwordIsCorrect = await checkPassword(user, password);

      if (!passwordIsCorrect) {
        return done(null, false);
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

function userResponse(user) {
  return {
    id: user.id,
    username: user.username,
  };
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ error: "Not authenticated" });
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/sessions", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }

      return res.json(userResponse(user));
    });
  })(req, res, next);
});

app.get("/api/sessions/current", isLoggedIn, (req, res) => {
  res.json(userResponse(req.user));
});

app.delete("/api/sessions/current", isLoggedIn, (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    return res.status(200).json({ message: "Logged out" });
  });
});

app.get("/api/network", isLoggedIn, async (req, res, next) => {
  try {
    const network = await getFullNetwork();
    res.json(network);
  } catch (err) {
    next(err);
  }
});

app.get("/api/segments", isLoggedIn, async (req, res, next) => {
  try {
    const segments = await getSegments();
    res.json(segments);
  } catch (err) {
    next(err);
  }
});

app.post("/api/games", isLoggedIn, async (req, res, next) => {
  try {
    const game = await createNewGame(req.user.id);
    res.json(game);
  } catch (err) {
    next(err);
  }
});

app.post("/api/games/:gameId/route", isLoggedIn, async (req, res, next) => {
  const gameId = Number(req.params.gameId);
  const segmentIds = req.body.segmentIds;

  if (!Array.isArray(segmentIds)) {
    return res.status(400).json({ error: "segmentIds must be an array" });
  }

  try {
    const result = await submitRoute(gameId, req.user.id, segmentIds);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
