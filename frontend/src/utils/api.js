/**
 * Safe fetch that handles empty/invalid JSON responses
 */
export async function fetchJson(url, options = {}) {
  let res
  try {
    res = await fetch(url, options)
  } catch (e) {
    const msg = e?.message || String(e)
    if (msg.toLowerCase().includes('fetch') || e?.name === 'TypeError') {
      throw new Error('Cannot reach the server. Make sure the backend is running (run "npm run dev" from the project root).')
    }
    throw e
  }
  const text = await res.text()
  if (!text || !text.trim()) {
    throw new Error(res.ok ? 'Empty response' : `Request failed: ${res.status}`)
  }
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Invalid response: ${text.slice(0, 100)}...`)
  }
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`)
  }
  return data
}
