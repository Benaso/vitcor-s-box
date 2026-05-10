const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'

export async function fetchApi(path, options) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  })

  if (!response.ok) {
    let message = `API request failed: ${response.status}`

    try {
      const errorBody = await response.json()
      if (errorBody?.message) {
        message = errorBody.message
      }
    } catch {
      // Keep the status-based fallback when the backend does not return JSON.
    }

    throw new Error(message)
  }

  return response.json()
}

export function fetchSiteContent() {
  return fetchApi('/site')
}

export function fetchGraphData() {
  return fetchApi('/graph')
}

export function postMarvinMessage(message, history) {
  return fetchApi('/agent/marvin', {
    method: 'POST',
    body: JSON.stringify({ message, history })
  })
}
