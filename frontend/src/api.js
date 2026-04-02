export const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8001';

console.log('[API] Base URL:', API_BASE);

export function api(path){
  const url = `${API_BASE}${path}`;
  console.log('[API] Request URL:', url);
  return url;
}

// Fetch wrapper with logging
export async function apiFetch(path, options = {}) {
  const url = api(path);
  console.log('[API] Fetching:', url, options);
  try {
    const response = await fetch(url, options);
    console.log('[API] Response status:', response.status, response.statusText);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('[API] Response data:', data);
    return data;
  } catch (error) {
    console.error('[API] Fetch error:', error.message);
    throw error;
  }
}
