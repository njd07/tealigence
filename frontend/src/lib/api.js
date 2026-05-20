const BASE_URL = import.meta.env.VITE_API_URL || '';

function getHeaders() {
  const token = localStorage.getItem('tealigence_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Login failed'); }
  return res.json();
}

export async function register(username, password) {
  const res = await fetch(`${BASE_URL}/api/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Registration failed'); }
  return res.json();
}

export async function sendChatMessage(message, history) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST', headers: getHeaders(),
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Chat error'); }
  return res.json();
}

export async function analyzeTeaLeaf(file) {
  const token = localStorage.getItem('tealigence_token');
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/api/vision`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Vision error'); }
  return res.json();
}

export async function getSupplyChainData() {
  const res = await fetch(`${BASE_URL}/api/supply-chain`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load supply chain data');
  return res.json();
}

export async function getWeatherData() {
  const res = await fetch(`${BASE_URL}/api/weather`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load weather data');
  return res.json();
}

// Aliases for component imports
export { login as loginUser, register as registerUser };
