const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function fetchAPI(url: string, options: RequestInit = {}) {
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_URL}${url}`, { ...options, headers, credentials: 'include' });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  login: (email: string, password: string) => 
    fetchAPI('/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  
  register: (name: string, email: string, password: string) => 
    fetchAPI('/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  logout: () => fetchAPI('/logout', { method: 'POST' }),
  
  getCurrentUser: () => fetchAPI('/profile'),

  toggleGymSession: (gymId: string | null | undefined) =>
    fetchAPI(`/gyms/${gymId}`, { method: 'PATCH', body: JSON.stringify({ gymId }) }),

  tagOn: (machineId: string) => fetchAPI(`/machines/${machineId}/workout-logs`, { method: 'POST' }),

  tagOff: (machineId: string) => fetchAPI(`/machines/${machineId}/workout-logs/current`, { method: 'PATCH' }),

  enqueue: (machineId: string) => fetchAPI(`/machines/${machineId}/queue`, { method: 'POST' }),

  dequeue: () => fetchAPI(`/queue`, { method: 'DELETE' }),
};
