# Exam #1: "Last Race"

## Student: sXXXXXX Mohammadamin Berangi

## React Client Application Routes

- `/` - Public. Shows the instructions page with a short explanation of the game rules.
- `/login` - Public. Shows the login form and redirects an already logged-in user to `/ranking`.
- `/ranking` - Protected. Shows the ranking table for logged-in users.
- `/setup` - Protected. Loads and shows the full network and lets the user start a new game.
- `/play` - Protected. Lets the user plan a route by selecting segments before the timer ends.
- `/execution` - Protected. Shows the submitted route result step by step, or the invalid route reason.
- `/result` - Protected. Shows whether the route was valid and the final score.

## API Server

- GET `/api/health`
  - Public.
  - Response: `{ status: "ok" }`.

- POST `/api/sessions`
  - Public. Body: `{ username, password }`.
  - Logs in the user with Passport and returns `{ id, username }`.

- GET `/api/sessions/current`
  - Protected.
  - Returns the current logged-in user as `{ id, username }`.

- DELETE `/api/sessions/current`
  - Protected.
  - Logs out the current user and returns `{ message: "Logged out" }`.

- GET `/api/network`
  - Protected.
  - Returns stations, lines, and segments with line information.

- GET `/api/segments`
  - Protected.
  - Returns all segments with station ids and station names.

- POST `/api/games`
  - Protected.
  - Creates a new game and returns `gameId`, start station, destination station, `initialCoins`, and `planningSeconds`.

- POST `/api/games/:gameId/route`
  - Protected. URL parameter: `gameId`. Body: `{ segmentIds: [...] }`.
  - Validates and executes the route, returning `valid`, `initialCoins`, `finalScore`, and `steps`; invalid routes also include a `reason`.

- GET `/api/ranking`
  - Protected.
  - Returns an array of `{ username, bestScore }` for valid completed games.

## Database Tables

- `users`: registered users with salted and hashed passwords.
- `stations`: underground stations.
- `lines`: metro lines.
- `segments`: station-to-station connections.
- `segment_lines`: relation between segments and lines.
- `events`: random execution events and coin effects.
- `games`: games played by users and final scores.

## Main React Components

- `App` (`client/src/App.jsx`): defines the routes and keeps login, current game, and execution result state.
- `NavigationBar` (`client/src/components/NavigationBar.jsx`): shows the app title, navigation links, username, and logout button.
- `InstructionsPage` (`client/src/pages/InstructionsPage.jsx`): shows the basic game rules and login-related message.
- `LoginPage` (`client/src/pages/LoginPage.jsx`): handles username/password login and saves the logged-in user in app state.
- `RankingPage` (`client/src/pages/RankingPage.jsx`): loads and displays the ranking table.
- `SetupPage` (`client/src/pages/SetupPage.jsx`): loads the network and starts a new game.
- `PlanningPage` (`client/src/pages/PlanningPage.jsx`): loads segments, shows the timer, and lets the user build and submit a route.
- `ExecutionPage` (`client/src/pages/ExecutionPage.jsx`): displays route execution steps or an invalid route message.
- `ResultPage` (`client/src/pages/ResultPage.jsx`): displays the final result and links to start again or view ranking.
- `NetworkMap` (`client/src/components/NetworkMap.jsx`): shows the network in setup mode or station names in planning mode.
- `SegmentList` (`client/src/components/SegmentList.jsx`): shows segment buttons and disables already selected segments.
- `SelectedRoute` (`client/src/components/SelectedRoute.jsx`): shows the selected segments in order.
- `Timer` (`client/src/components/Timer.jsx`): displays the remaining planning seconds.

## Screenshot

![Ranking page](./img/ranking.png)
![Game execution](./img/game.png)

## Users Credentials

- username: `user1`, password: `password`
- username: `user2`, password: `password`
- username: `user3`, password: `password`

## Use of AI Tools

AI tools were used to understand the project requirements, plan the implementation steps, generate and refine parts of the code, debug errors, simplify the code, and improve the README. The output was manually reviewed, tested, and adapted by the student.
