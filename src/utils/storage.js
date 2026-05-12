export function loadJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)

    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function saveJson(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}