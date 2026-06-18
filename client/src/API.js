const API_URL = "http://localhost:3001/api";

async function handleResponse(response) {
  if (response.ok) {
    return response.json();
  }

  let message = "API request failed";

  try {
    const errorBody = await response.json();
    message = errorBody.error || message;
  } catch {
    message = `${message} (${response.status})`;
  }

  throw new Error(message);
}

export async function logIn(credentials) {
  const response = await fetch(`${API_URL}/sessions`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  return handleResponse(response);
}

export async function logOut() {
  const response = await fetch(`${API_URL}/sessions/current`, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/sessions/current`, {
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getRanking() {
  const response = await fetch(`${API_URL}/ranking`, {
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getNetwork() {
  const response = await fetch(`${API_URL}/network`, {
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getSegments() {
  const response = await fetch(`${API_URL}/segments`, {
    credentials: "include",
  });

  return handleResponse(response);
}

export async function startGame() {
  const response = await fetch(`${API_URL}/games`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
}

export async function submitRoute(gameId, segmentIds) {
  const response = await fetch(`${API_URL}/games/${gameId}/route`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ segmentIds }),
  });

  return handleResponse(response);
}
