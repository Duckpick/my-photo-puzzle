export function getMonthlyCode() {
  const now = new Date()

  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const seed = `${year}-${month}-duckpick-photo`

  let hash = 0

  for (let i = 0; i < seed.length; i += 1) {
    hash =
      (hash * 31 + seed.charCodeAt(i)) % 1000000
  }

  return `dp${String(hash).padStart(6, "0")}`
}

export function checkMonthlyCode(input) {
  return (
    input.trim().toLowerCase() ===
    getMonthlyCode().toLowerCase()
  )
}