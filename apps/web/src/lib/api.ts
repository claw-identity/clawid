const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: { code: string; message: string } }> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const json = await res.json();
  return json;
}

export const api = {
  // Agents
  registerAgent: (data: { name: string; description?: string; owner_email: string }) =>
    apiFetch('/agents/register', { method: 'POST', body: JSON.stringify(data) }),

  getAgent: (clawId: string) => apiFetch(`/agents/${clawId}`),

  searchAgents: (q?: string, limit = 10, offset = 0) =>
    apiFetch(`/agents/search?${q ? `q=${encodeURIComponent(q)}&` : ''}limit=${limit}&offset=${offset}`),

  updateAgent: (data: Record<string, unknown>, apiKey: string) =>
    apiFetch('/agents/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${apiKey}` },
    }),

  // Verify
  verifyAgent: (clawId: string, apiKey?: string) =>
    apiFetch('/verify', {
      method: 'POST',
      body: JSON.stringify({ claw_id: clawId }),
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    }),

  // Auth - Human
  signup: (data: { email: string; password: string; name?: string }) =>
    apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  // Users
  getMe: (sessionToken: string) =>
    apiFetch('/users/me', { headers: { Authorization: `Bearer ${sessionToken}` } }),

  registerAgentAsUser: (data: { name: string; description?: string }, sessionToken: string) =>
    apiFetch('/users/me/agents', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${sessionToken}` },
    }),

  // Stats
  getStats: () => apiFetch('/stats'),
};
